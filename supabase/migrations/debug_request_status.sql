
CREATE OR REPLACE FUNCTION get_request_status_details(req_id UUID)
RETURNS TABLE (
    request_id UUID,
    status_id INT,
    status_code VARCHAR,
    admin_price NUMERIC,
    requester_accepted_price BOOLEAN,
    requester_rejection_reason TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id,
        r.status_id,
        lv.code,
        r.admin_price,
        r.requester_accepted_price,
        r.requester_rejection_reason
    FROM requests r
    LEFT JOIN lookup_values lv ON r.status_id = lv.id
    WHERE r.id = req_id;
END;
$$ LANGUAGE plpgsql;
