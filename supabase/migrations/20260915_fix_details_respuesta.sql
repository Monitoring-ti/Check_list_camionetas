-- Fix: la RPC de producción insertaba en monitoring_inspection_details.respuesta,
-- columna que ya no existe (el esquema usa is_good).
-- Ejecutar en el SQL Editor de Supabase.

CREATE OR REPLACE FUNCTION public.check_submit_inspection(
  p_session_token uuid,
  p_payload jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sess public.check_field_sessions%ROWTYPE;
  v_insp_id uuid;
  v_km integer;
  v_last_km integer;
  v_resultado text;
  v_detail jsonb;
BEGIN
  SELECT * INTO v_sess
  FROM public.check_field_sessions
  WHERE id = p_session_token
    AND used_at IS NULL
    AND expires_at > timezone('utc', now())
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Sesión inválida o expirada. Vuelva a ingresar RUT y patente.');
  END IF;

  v_km := (p_payload->>'kilometraje')::integer;
  SELECT km_actual INTO v_last_km FROM public.vehicles WHERE id = v_sess.vehicle_id;

  IF v_km IS NULL OR v_km <= coalesce(v_last_km, 0) THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error', format('Kilometraje debe ser mayor a %s', coalesce(v_last_km, 0))
    );
  END IF;

  v_resultado := coalesce(p_payload->>'resultado', 'Vehículo Apto');

  INSERT INTO public.monitoring_inspections (
    fecha, hora, responsable_inspeccion, cargo, patente,
    kilometraje, marca_modelo, anio, observaciones, resultado,
    firma_url, foto_frontal, foto_trasera, foto_lateral_der, foto_lateral_izq,
    nivel_combustible
  ) VALUES (
    (p_payload->>'fecha')::date,
    (p_payload->>'hora')::time,
    p_payload->>'responsable_inspeccion',
    p_payload->>'cargo',
    p_payload->>'patente',
    v_km,
    p_payload->>'marca_modelo',
    (p_payload->>'anio')::integer,
    nullif(p_payload->>'observaciones', ''),
    v_resultado,
    nullif(p_payload->>'firma_url', ''),
    nullif(p_payload->>'foto_frontal', ''),
    nullif(p_payload->>'foto_trasera', ''),
    nullif(p_payload->>'foto_lateral_der', ''),
    nullif(p_payload->>'foto_lateral_izq', ''),
    nullif(p_payload->>'nivel_combustible', '')
  )
  RETURNING id INTO v_insp_id;

  FOR v_detail IN SELECT * FROM jsonb_array_elements(coalesce(p_payload->'details', '[]'::jsonb))
  LOOP
    INSERT INTO public.monitoring_inspection_details (
      inspection_id, seccion, item_key, item_label,
      is_good, descripcion, foto_url, geotag, is_blocking
    ) VALUES (
      v_insp_id,
      v_detail->>'seccion',
      v_detail->>'item_key',
      v_detail->>'item_label',
      coalesce(
        (nullif(v_detail->>'is_good', ''))::boolean,
        CASE lower(coalesce(v_detail->>'respuesta', ''))
          WHEN 'true' THEN true
          WHEN 't' THEN true
          WHEN '1' THEN true
          WHEN 'si' THEN true
          WHEN 'sí' THEN true
          WHEN 'ok' THEN true
          WHEN 'false' THEN false
          WHEN 'f' THEN false
          WHEN '0' THEN false
          WHEN 'no' THEN false
          ELSE NULL
        END,
        false
      ),
      nullif(v_detail->>'descripcion', ''),
      nullif(v_detail->>'foto_url', ''),
      nullif(v_detail->>'geotag', ''),
      coalesce((v_detail->>'is_blocking')::boolean, false)
    );
  END LOOP;

  UPDATE public.vehicles
  SET km_actual = v_km,
      last_inspection_at = timezone('utc', now())
  WHERE id = v_sess.vehicle_id;

  UPDATE public.check_field_sessions
  SET used_at = timezone('utc', now())
  WHERE id = p_session_token;

  RETURN jsonb_build_object(
    'ok', true,
    'inspection_id', v_insp_id,
    'resultado', v_resultado
  );
END;
$$;

REVOKE ALL ON FUNCTION public.check_submit_inspection(uuid, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_submit_inspection(uuid, jsonb) TO anon, authenticated;
