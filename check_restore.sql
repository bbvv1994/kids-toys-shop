SELECT COUNT(*) as product_count FROM "Product";
SELECT COUNT(*) as category_count FROM "Category";
SELECT COUNT(*) as user_count FROM "User";
SELECT COUNT(*) as review_count FROM "Review";
SELECT id, name, price, "ageGroup", gender, "categoryName", array_length("imageUrls", 1) as image_count FROM "Product" LIMIT 3;

