import json
import os
from datetime import datetime, timedelta

try:
    import firebase_admin
    from firebase_admin import credentials, firestore
except ImportError:
    firebase_admin = None
    firestore = None

from config import Config

_db = None


def _parse_datetime(value):
    if value is None:
        return None
    if isinstance(value, datetime):
        return value
    if isinstance(value, str):
        try:
            return datetime.fromisoformat(value)
        except ValueError:
            try:
                return datetime.strptime(value, '%Y-%m-%dT%H:%M:%S')
            except ValueError:
                return None
    return None


def _format_datetime(value):
    dt = _parse_datetime(value)
    if not dt:
        return None
    return dt.strftime('%b %d, %Y %I:%M %p')


def _normalize_history_entry(data):
    return {
        'item': data.get('item') or data.get('waste') or 'Unknown item',
        'category': data.get('category') or data.get('categoryName') or data.get('category_label') or 'Unknown',
        'formattedDate': data.get('formattedDate') or data.get('date') or data.get('scannedAt') or _format_datetime(data.get('timestamp')) or 'Unknown date',
        'recyclable': data.get('recyclable') if data.get('recyclable') is not None else data.get('isRecyclable', False),
        'hazardous': data.get('hazardous') if data.get('hazardous') is not None else data.get('isHazardous', False),
        'disposal': data.get('disposal') or (data.get('fullResponse') or {}).get('disposal') or '',
        'notes': data.get('notes') or data.get('note') or '',
        'categoryIcon': data.get('category_icon') or data.get('icon') or data.get('categoryIcon') or '',
        'timestamp': data.get('timestamp') or data.get('date') or data.get('scannedAt')
    }


def _normalize_center_entry(data, doc_id=None):
    location = data.get('location') or {}
    return {
        'id': data.get('id') or doc_id,
        'name': data.get('name') or data.get('title') or 'Collection Center',
        'address': data.get('address') or data.get('location_address') or '',
        'city': data.get('city') or data.get('region') or '',
        'phone': data.get('phone') or data.get('contactPhone') or '',
        'email': data.get('email') or data.get('contactEmail') or '',
        'hours': data.get('hours') or data.get('openingHours') or '',
        'notes': data.get('notes') or data.get('description') or '',
        'waste_types': data.get('waste_types') or data.get('categories') or data.get('accepted_materials') or [],
        'latitude': data.get('latitude') or location.get('latitude') or location.get('lat'),
        'longitude': data.get('longitude') or location.get('longitude') or location.get('lng'),
        'location': location
    }


def _safe_collection(db, name):
    try:
        return db.collection(name)
    except Exception:
        return None


def _initialize_firestore():
    global _db
    if _db is not None:
        return _db
    if firebase_admin is None or firestore is None:
        return None

    try:
        if not firebase_admin._apps:
            credentials_obj = None
            if Config.FIREBASE_SERVICE_ACCOUNT_JSON:
                try:
                    credentials_data = json.loads(Config.FIREBASE_SERVICE_ACCOUNT_JSON)
                    credentials_obj = credentials.Certificate(credentials_data)
                except Exception:
                    credentials_obj = None

            service_account_path = Config.FIREBASE_SERVICE_ACCOUNT_PATH or os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
            if not credentials_obj and service_account_path and os.path.exists(service_account_path):
                try:
                    credentials_obj = credentials.Certificate(service_account_path)
                except Exception:
                    credentials_obj = None

            if credentials_obj:
                if Config.FIREBASE_PROJECT_ID:
                    firebase_admin.initialize_app(credentials_obj, {
                        'projectId': Config.FIREBASE_PROJECT_ID
                    })
                else:
                    firebase_admin.initialize_app(credentials_obj)
            else:
                firebase_admin.initialize_app()

        _db = firestore.client()
        return _db
    except Exception:
        return None


def is_firestore_available():
    return _initialize_firestore() is not None


def _fetch_collection_documents(db, collection_name):
    collection = _safe_collection(db, collection_name)
    if collection is None:
        return []
    try:
        return list(collection.stream())
    except Exception:
        return []


def fetch_user_history(uid):
    db = _initialize_firestore()
    if not db:
        return []

    candidates = [
        ('users', f'users/{uid}/history'),
        ('history', None),
        ('scan_history', None)
    ]

    for collection_name, path in candidates:
        try:
            if path:
                docs = db.collection('users').document(uid).collection('history').order_by('timestamp', direction=firestore.Query.DESCENDING).stream()
            else:
                query = db.collection(collection_name)
                if uid:
                    query = query.where('userId', '==', uid)
                docs = query.order_by('timestamp', direction=firestore.Query.DESCENDING).stream()
            entries = [_normalize_history_entry(doc.to_dict()) for doc in docs]
            if entries:
                return entries
        except Exception:
            continue
    return []


def fetch_centers():
    db = _initialize_firestore()
    if not db:
        return []

    common_names = ['collection_centers', 'centers', 'recycling_centers', 'waste_centers']
    for name in common_names:
        docs = _fetch_collection_documents(db, name)
        if docs:
            return [_normalize_center_entry(doc.to_dict(), doc.id) for doc in docs]
    return []


def compute_dashboard_data(history_entries):
    total_scans = len(history_entries)
    recyclable_count = sum(1 for entry in history_entries if entry.get('recyclable'))
    hazardous_count = sum(1 for entry in history_entries if entry.get('hazardous'))
    recycle_percentage = round((recyclable_count / total_scans) * 100, 1) if total_scans else 0

    category_counts = {}
    for entry in history_entries:
        label = entry.get('category') or 'Unknown'
        category_counts[label] = category_counts.get(label, 0) + 1

    category_counts_list = [
        {'label': label, 'value': count}
        for label, count in sorted(category_counts.items(), key=lambda x: x[1], reverse=True)
    ]

    today = datetime.utcnow().date()
    labels = []
    counts_by_day = {}
    for days_ago in range(6, -1, -1):
        day = today - timedelta(days=days_ago)
        label = day.strftime('%a')
        labels.append(label)
        counts_by_day[label] = 0

    for entry in history_entries:
        ts = _parse_datetime(entry.get('timestamp'))
        if ts is None and isinstance(entry.get('formattedDate'), str):
            ts = _parse_datetime(entry.get('formattedDate'))
        if ts:
            label = ts.date().strftime('%a')
            if label in counts_by_day:
                counts_by_day[label] += 1

    trend_data = [counts_by_day[label] for label in labels]

    return {
        'totalScans': total_scans,
        'recyclableCount': recyclable_count,
        'hazardousCount': hazardous_count,
        'recyclePercentage': recycle_percentage,
        'categoryCounts': category_counts_list,
        'sevenDayTrend': {
            'labels': labels,
            'datasets': [
                {
                    'label': 'Scans',
                    'data': trend_data,
                    'borderColor': '#22C55E',
                    'backgroundColor': 'rgba(34, 197, 94, 0.2)'
                }
            ]
        }
    }


def get_demo_history():
    return [
        {
            'item': 'Plastic Bottle',
            'category': 'Plastic',
            'formattedDate': 'Jul 10, 2026 02:15 PM',
            'recyclable': True,
            'hazardous': False,
            'disposal': 'Rinse and recycle according to your local plastic recycling rules.',
            'notes': 'Remove cap before recycling.'
        },
        {
            'item': 'Battery',
            'category': 'Hazardous',
            'formattedDate': 'Jul 09, 2026 11:45 AM',
            'recyclable': False,
            'hazardous': True,
            'disposal': 'Take to an electronics recycling facility or hazardous waste drop-off.',
            'notes': 'Do not dispose of in regular trash.'
        },
        {
            'item': 'Cardboard Box',
            'category': 'Paper',
            'formattedDate': 'Jul 08, 2026 09:30 AM',
            'recyclable': True,
            'hazardous': False,
            'disposal': 'Flatten and place in your paper recycling bin.',
            'notes': ''
        }
    ]


def get_demo_centers():
    return [
        {
            'id': 'center-1',
            'name': 'Greenway Recycling Center',
            'address': '123 Eco Lane',
            'city': 'Springfield',
            'latitude': 37.7749,
            'longitude': -122.4194,
            'waste_types': ['Plastic', 'Paper', 'Glass', 'Electronics'],
            'phone': '(555) 123-4567',
            'email': 'info@greenwayrecycle.com',
            'hours': 'Mon-Fri 9am - 6pm',
            'notes': 'Accepted materials may vary by location.'
        },
        {
            'id': 'center-2',
            'name': 'Community Hazardous Waste Drop-off',
            'address': '450 Safe Disposal Rd',
            'city': 'Riverbend',
            'latitude': 34.0522,
            'longitude': -118.2437,
            'waste_types': ['Batteries', 'Paint', 'Electronics', 'Chemicals'],
            'phone': '(555) 987-6543',
            'email': 'dropoff@safeeco.org',
            'hours': 'Sat-Sun 10am - 4pm',
            'notes': 'Appointment recommended for large items.'
        }
    ]


def get_demo_dashboard():
    history = get_demo_history()
    return compute_dashboard_data(history)
