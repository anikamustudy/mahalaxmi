/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `brands` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[title]` on the table `features` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `pricing_plans` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `testimonials` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "brands_name_key" ON "public"."brands"("name");

-- CreateIndex
CREATE UNIQUE INDEX "features_title_key" ON "public"."features"("title");

-- CreateIndex
CREATE UNIQUE INDEX "pricing_plans_name_key" ON "public"."pricing_plans"("name");

-- CreateIndex
CREATE UNIQUE INDEX "testimonials_name_key" ON "public"."testimonials"("name");
