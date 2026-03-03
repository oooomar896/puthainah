-- 002_lookups_and_cities.sql
-- الجداول المرجعية (Lookup) والمدن

CREATE TABLE IF NOT EXISTS lookup_types (
    id          SERIAL PRIMARY KEY,
    code        VARCHAR(100) UNIQUE NOT NULL, -- مثال: requester-entity-types, request-status
    name_ar     VARCHAR(255) NOT NULL,
    name_en     VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS lookup_values (
    id              SERIAL PRIMARY KEY,
    lookup_type_id  INT NOT NULL REFERENCES lookup_types(id) ON DELETE CASCADE,
    code            VARCHAR(100) NOT NULL,
    name_ar         VARCHAR(255) NOT NULL,
    name_en         VARCHAR(255) NOT NULL,
    UNIQUE (lookup_type_id, code)
);

CREATE TABLE IF NOT EXISTS cities (
    id          SERIAL PRIMARY KEY,
    name_ar     VARCHAR(255) NOT NULL,
    name_en     VARCHAR(255) NOT NULL
);


