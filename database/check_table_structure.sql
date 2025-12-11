-- ============================================
-- CHECK EXISTING TABLE STRUCTURE AND FIX
-- Run this in Supabase SQL Editor
-- ============================================

-- First, let's see what columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'product_images' 
AND table_schema = 'public';

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'product_skus' 
AND table_schema = 'public';
