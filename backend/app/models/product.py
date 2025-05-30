class Product:
    def __init__(self, id, name, price, types, material, brand, country, color, url, photonum, desc="no", massa="no", struct="no", use="no"):
        self.id = id
        self.name = name
        self.price = price
        self.types = types
        self.material = material
        self.brand = brand
        self.country = country
        self.color = color
        self.url = url
        self.photonum = photonum
        self.desc = desc
        self.massa = massa
        self.struct = struct
        self.use = use

    def to_dict(self):
        return {
            key: value
            for key, value in self.__dict__.items()
            if value not in ("no", "", None)
        }
