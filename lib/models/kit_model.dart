class KitItem {
  final String id;
  final String name;
  final String category;
  final String icon;
  final bool isChecked;
  final int priority;

  KitItem({
    required this.id,
    required this.name,
    required this.category,
    required this.icon,
    this.isChecked = false,
    this.priority = 1,
  });

  KitItem copyWith({bool? isChecked}) {
    return KitItem(
      id: id,
      name: name,
      category: category,
      icon: icon,
      isChecked: isChecked ?? this.isChecked,
      priority: priority,
    );
  }
}

class MapPoint {
  final double lat;
  final double lng;
  final String label;

  MapPoint({required this.lat, required this.lng, required this.label});
}

class EvacuationPlan {
  final String id;
  final String name;
  final String destination;
  final double distanceKm;
  final List<String> steps;
  final String transport;
  final String estimatedTime;
  final double startLat;
  final double startLng;
  final double endLat;
  final double endLng;
  final List<MapPoint> waypoints;

  EvacuationPlan({
    required this.id,
    required this.name,
    required this.destination,
    required this.distanceKm,
    required this.steps,
    required this.transport,
    this.estimatedTime = '',
    this.startLat = 48.8698,
    this.startLng = 2.2219,
    this.endLat = 48.7356,
    this.endLng = 1.3639,
    this.waypoints = const [],
  });
}
