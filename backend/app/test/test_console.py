from app.models.utils import get_all_products, get_products_by_type, get_filtered_products

print("Все товары:")
for p in get_all_products()[:5]:
    print(p)

print("\nТолько женские:")
for p in get_products_by_type("Товары для лица")[:5]:
    print(p)

print("Фильтр: бренд='MAX MARA', сортировка по цене по возрастанию")
products = get_filtered_products(brand="MAX MARA", sort_by="price_asc")
for p in products:  # Покажи первые 5
    print(p)

print("\nПоиск по имени 'SOLAR'")
products = get_filtered_products(search="SOLAR")
for p in products:
    print(p)
