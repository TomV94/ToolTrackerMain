-- Database Size
SELECT pg_size_pretty(pg_database_size('tool_tracker')) as database_size;

-- Table Sizes
SELECT 
    relname as table_name,
    pg_size_pretty(pg_total_relation_size(relid)) as total_size,
    pg_size_pretty(pg_relation_size(relid)) as table_size,
    pg_size_pretty(pg_total_relation_size(relid) - pg_relation_size(relid)) as index_size
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC;

-- Long Running Queries
SELECT 
    pid,
    now() - pg_stat_activity.query_start AS duration,
    query,
    state
FROM pg_stat_activity
WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes'
    AND state != 'idle';

-- Index Usage Statistics
SELECT
    schemaname,
    relname as table_name,
    indexrelname as index_name,
    pg_size_pretty(pg_relation_size(i.indexrelid)) as index_size,
    idx_scan as number_of_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes ui
JOIN pg_index i ON ui.indexrelid = i.indexrelid
WHERE schemaname = 'public'
ORDER BY pg_relation_size(i.indexrelid) DESC;

-- Table Statistics
SELECT
    relname as table_name,
    seq_scan as sequential_scans,
    seq_tup_read as sequential_tuples_read,
    idx_scan as index_scans,
    idx_tup_fetch as index_tuples_fetched,
    n_live_tup as estimated_live_tuples,
    n_dead_tup as estimated_dead_tuples
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;

-- Connection Statistics
SELECT
    datname as database_name,
    numbackends as active_connections,
    xact_commit as transactions_committed,
    xact_rollback as transactions_rollback,
    blks_read as blocks_read,
    blks_hit as blocks_hit,
    tup_returned as rows_returned,
    tup_fetched as rows_fetched,
    tup_inserted as rows_inserted,
    tup_updated as rows_updated,
    tup_deleted as rows_deleted
FROM pg_stat_database
WHERE datname = 'tool_tracker';

-- Vacuum Analysis
SELECT
    relname as table_name,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze
FROM pg_stat_user_tables
ORDER BY last_vacuum DESC NULLS LAST;

-- Lock Information
SELECT
    blocked_locks.pid AS blocked_pid,
    blocked_activity.usename AS blocked_user,
    blocking_locks.pid AS blocking_pid,
    blocking_activity.usename AS blocking_user,
    blocked_activity.query AS blocked_statement,
    blocking_activity.query AS blocking_statement
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks 
    ON blocking_locks.locktype = blocked_locks.locktype
    AND blocking_locks.DATABASE IS NOT DISTINCT FROM blocked_locks.DATABASE
    AND blocking_locks.relation IS NOT DISTINCT FROM blocked_locks.relation
    AND blocking_locks.page IS NOT DISTINCT FROM blocked_locks.page
    AND blocking_locks.tuple IS NOT DISTINCT FROM blocked_locks.tuple
    AND blocking_locks.virtualxid IS NOT DISTINCT FROM blocked_locks.virtualxid
    AND blocking_locks.transactionid IS NOT DISTINCT FROM blocked_locks.transactionid
    AND blocking_locks.classid IS NOT DISTINCT FROM blocked_locks.classid
    AND blocking_locks.objid IS NOT DISTINCT FROM blocked_locks.objid
    AND blocking_locks.objsubid IS NOT DISTINCT FROM blocked_locks.objsubid
    AND blocking_locks.pid != blocked_locks.pid
JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.GRANTED;

-- Create Maintenance Functions
CREATE OR REPLACE FUNCTION analyze_tables() RETURNS void AS $$
DECLARE
    table_record RECORD;
BEGIN
    FOR table_record IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE 'ANALYZE ' || table_record.tablename;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION vacuum_tables() RETURNS void AS $$
DECLARE
    table_record RECORD;
BEGIN
    FOR table_record IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE 'VACUUM ANALYZE ' || table_record.tablename;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create Backup Function
CREATE OR REPLACE FUNCTION create_backup() RETURNS void AS $$
BEGIN
    -- This is a placeholder. Actual backup should be done using pg_dump
    RAISE NOTICE 'Please use pg_dump for creating backups';
END;
$$ LANGUAGE plpgsql; 