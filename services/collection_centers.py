COLLECTION_CENTERS = [
    {
        "name": "Green City Recycling Hub",
        "city": "Metro City",
        "address": "123 Eco Avenue",
        "type": "plastic",
        "waste_types": ["plastic", "metal"],
        "contact": "support@greencityrecycling.com",
    },
    {
        "name": "Paper Trail Center",
        "city": "River Town",
        "address": "45 Paper Lane",
        "type": "paper",
        "waste_types": ["paper", "cardboard"],
        "contact": "contact@papertrail.org",
    },
    {
        "name": "Safe Disposal Point",
        "city": "Oakville",
        "address": "78 Hazard Road",
        "type": "hazardous",
        "waste_types": ["battery", "electronic", "hazardous"],
        "contact": "help@safedisposal.org",
    },
    {
        "name": "Glass and Metal Recovery Center",
        "city": "Lakeview",
        "address": "12 Recycle Street",
        "type": "glass",
        "waste_types": ["glass", "metal"],
        "contact": "info@glassmetalrecovery.com",
    },
]


def get_collection_centers(waste_type=None):
    if not waste_type:
        return COLLECTION_CENTERS

    normalized_type = waste_type.strip().lower()
    return [
        center
        for center in COLLECTION_CENTERS
        if normalized_type in [item.lower() for item in center.get("waste_types", [])]
    ]
