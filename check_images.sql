SELECT id, name, "imageUrls" FROM "Product" WHERE array_length("imageUrls", 1) > 0 LIMIT 3;
SELECT COUNT(*) as products_with_images FROM "Product" WHERE array_length("imageUrls", 1) > 0;
SELECT COUNT(*) as cloudinary_images FROM "Product" WHERE EXISTS (SELECT 1 FROM unnest("imageUrls") AS url WHERE url LIKE '%cloudinary.com%');

