import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  RecoveryListing,
  getRecoveryListings,
} from '../services/recoveryHubStorage';
import {
  RouteAnalytics,
  RouteStop,
  NearbyEcosystemEntity,
  buildOptimizedRoute,
  getNearbyReceivers,
  getNearbyIndustries,
  PROVIDER_DEFAULT_NAME,
  PROVIDER_DEFAULT_LOCATION,
  PROVIDER_DEFAULT_COORDS,
} from '../services/mapAnalyticsService';
import { StoredRegistration } from '../services/registrationStorage';
import {
  Navigation,
  MapPin,
  Clock,
  Gauge,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Truck,
  Building,
  RefreshCw,
  Layers,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Info,
  Maximize2,
  Minimize2,
  Compass,
  Phone,
  Calendar,
  Weight,
  HelpCircle,
} from 'lucide-react';

interface MapAnalyticsViewProps {
  user?: StoredRegistration | null;
  onBackToDashboard: () => void;
  initialListingId?: string;
  initialFlow?: 'FOOD_RECOVERY' | 'RESOURCE_RECOVERY';
}

export const MapAnalyticsView: React.FC<MapAnalyticsViewProps> = ({
  user,
  onBackToDashboard,
  initialListingId,
  initialFlow = 'FOOD_RECOVERY',
}) => {
  // Current Recovery Flow: FOOD RECOVERY vs RESOURCE RECOVERY (Never mixed)
  const [activeFlow, setActiveFlow] = useState<'FOOD_RECOVERY' | 'RESOURCE_RECOVERY'>(initialFlow);
  
  // Ecosystem Tab: NGOs & RECEIVERS vs INDUSTRIES & BUYERS
  const [ecosystemTab, setEcosystemTab] = useState<'RECEIVERS' | 'BUYERS'>(
    initialFlow === 'FOOD_RECOVERY' ? 'RECEIVERS' : 'BUYERS'
  );

  // Multi-stop vs Single Stop View
  const [routeMode, setRouteMode] = useState<'AUTO_CONSOLIDATED' | 'SINGLE_SELECTION'>('AUTO_CONSOLIDATED');
  const [selectedSingleListingId, setSelectedSingleListingId] = useState<string | null>(initialListingId || null);

  // Loading & Route State
  const [isLoadingRoute, setIsLoadingRoute] = useState<boolean>(true);
  const [routeData, setRouteData] = useState<RouteAnalytics | null>(null);
  const [allListings, setAllListings] = useState<RecoveryListing[]>([]);
  const [showNearbyMarkers, setShowNearbyMarkers] = useState<boolean>(true);
  const [selectedEntityForDetails, setSelectedEntityForDetails] = useState<NearbyEcosystemEntity | null>(null);

  // Map DOM reference & Leaflet instances
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routeLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const ecosystemLayerGroupRef = useRef<L.LayerGroup | null>(null);

  const nearbyReceivers = getNearbyReceivers();
  const nearbyIndustries = getNearbyIndustries();

  const providerName = user?.orgName || PROVIDER_DEFAULT_NAME;
  const providerLocation = user?.location || (user?.address ? `${user.address}, ${user.city}` : PROVIDER_DEFAULT_LOCATION);
  const providerCoords: [number, number] = PROVIDER_DEFAULT_COORDS;

  // Sync ecosystem tab when flow changes
  useEffect(() => {
    setEcosystemTab(activeFlow === 'FOOD_RECOVERY' ? 'RECEIVERS' : 'BUYERS');
  }, [activeFlow]);

  // Load and refresh listings from storage
  const loadListingsAndRoute = async () => {
    setIsLoadingRoute(true);
    const listings = getRecoveryListings();
    setAllListings(listings);

    // Filter relevant listings based on activeFlow and single vs multi selection
    let filteredListings = listings;
    if (routeMode === 'SINGLE_SELECTION' && selectedSingleListingId) {
      filteredListings = listings.filter((l) => l.id === selectedSingleListingId);
    }

    try {
      const result = await buildOptimizedRoute(
        activeFlow,
        filteredListings,
        providerName,
        providerLocation,
        providerCoords
      );
      setRouteData(result);
    } catch (err) {
      console.error('Failed to calculate optimized route:', err);
    } finally {
      setIsLoadingRoute(false);
    }
  };

  useEffect(() => {
    loadListingsAndRoute();
  }, [activeFlow, routeMode, selectedSingleListingId]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Center on Nagpur
      const map = L.map(mapContainerRef.current, {
        center: [21.1255, 79.0522],
        zoom: 12,
        zoomControl: false,
      });

      // Add standard clean CartoDB Voyager or OpenStreetMap tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      // Add Zoom Control at top right
      L.control.zoom({ position: 'topright' }).addTo(map);

      const routeGroup = L.layerGroup().addTo(map);
      const ecoGroup = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
      routeLayerGroupRef.current = routeGroup;
      ecosystemLayerGroupRef.current = ecoGroup;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Custom marker creators
  const createDivIcon = (htmlContent: string, className: string = '', iconSize: [number, number] = [36, 36]) => {
    return L.divIcon({
      html: htmlContent,
      className: `w2v-map-icon ${className}`,
      iconSize,
      iconAnchor: [iconSize[0] / 2, iconSize[1] / 2],
      popupAnchor: [0, -iconSize[1] / 2],
    });
  };

  // Render Map Layers when routeData or showNearbyMarkers changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const routeGroup = routeLayerGroupRef.current;
    const ecoGroup = ecosystemLayerGroupRef.current;
    if (!map || !routeGroup || !ecoGroup) return;

    routeGroup.clearLayers();
    ecoGroup.clearLayers();

    const bounds = L.latLngBounds([]);

    // 1. ADD PROVIDER / PICKUP MARKER
    const providerIconHtml = `
      <div class="relative flex items-center justify-center cursor-pointer">
        <div class="absolute -inset-2 bg-[#0C2D21]/25 rounded-full animate-ping"></div>
        <div class="w-10 h-10 rounded-full bg-[#0C2D21] border-2 border-white shadow-xl flex items-center justify-center text-white font-bold text-xs">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
      </div>
    `;

    const providerMarker = L.marker(providerCoords, {
      icon: createDivIcon(providerIconHtml, 'provider-marker', [40, 40]),
      zIndexOffset: 1000,
    }).bindPopup(`
      <div style="font-family: inherit; font-size: 12px; line-height: 1.4; color: #161A18; min-width: 220px; padding: 4px;">
        <div style="display: inline-block; padding: 2px 8px; border-radius: 9999px; background: #0C2D21; color: white; font-weight: 700; font-size: 9px; text-transform: uppercase; margin-bottom: 4px;">
          📍 PROVIDER / PICKUP LOCATION
        </div>
        <div style="font-weight: 800; font-size: 13px; color: #0C2D21; margin-bottom: 2px;">
          ${providerName}
        </div>
        <div style="font-size: 11px; color: #57534E; margin-bottom: 6px;">
          ${providerLocation}
        </div>
        <div style="padding: 4px 8px; background: #FAF8F3; border: 1px solid rgba(12,45,33,0.1); border-radius: 6px; font-size: 10px; font-weight: 600; color: #0C2D21;">
          Verified Institutional Kitchen · Ready for Dispatch
        </div>
      </div>
    `);

    routeGroup.addLayer(providerMarker);
    bounds.extend(providerCoords);

    // 2. ADD ROUTE POLYLINE & ACCEPTED DESTINATION MARKERS (IF ROUTE READY)
    if (routeData && routeData.status === 'ROUTE_READY' && routeData.stops.length > 0) {
      // Draw road polyline
      if (routeData.polylineCoords.length > 1) {
        // Outer glow/shadow casing
        const casing = L.polyline(routeData.polylineCoords, {
          color: '#064E3B',
          weight: 7,
          opacity: 0.4,
          lineCap: 'round',
          lineJoin: 'round',
        });
        routeGroup.addLayer(casing);

        // Core AI-Optimized road route line
        const routeLine = L.polyline(routeData.polylineCoords, {
          color: '#10B981',
          weight: 4.5,
          opacity: 0.95,
          dashArray: '1, 0',
          lineCap: 'round',
          lineJoin: 'round',
        });
        routeGroup.addLayer(routeLine);

        routeData.polylineCoords.forEach((pt) => bounds.extend(pt));
      }

      // Add markers for each accepted stop
      routeData.stops.forEach((stop, idx) => {
        const isMulti = routeData.stops.length > 1;
        const stopBadge = isMulti ? `STOP ${idx + 1}` : 'ACCEPTED DESTINATION';

        const destIconHtml = `
          <div class="relative flex items-center justify-center cursor-pointer">
            <div class="absolute -inset-1.5 bg-[#10B981]/30 rounded-full animate-pulse"></div>
            <div class="w-9 h-9 rounded-full bg-[#10B981] border-2 border-white shadow-xl flex items-center justify-center text-white font-extrabold text-xs">
              ${isMulti ? idx + 1 : '📍'}
            </div>
          </div>
        `;

        const destMarker = L.marker(stop.coordinates, {
          icon: createDivIcon(destIconHtml, 'dest-marker', [36, 36]),
          zIndexOffset: 900,
        }).bindPopup(`
          <div style="font-family: inherit; font-size: 12px; line-height: 1.4; color: #161A18; min-width: 240px; padding: 4px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; background: #059669; color: white; font-weight: 700; font-size: 9px; text-transform: uppercase;">
                ${stopBadge}
              </span>
              <span style="font-size: 10px; font-weight: 700; color: #059669;">
                ${stop.quantityKg} kg
              </span>
            </div>
            <div style="font-weight: 800; font-size: 13px; color: #0C2D21; margin-bottom: 2px;">
              ${stop.name}
            </div>
            <div style="font-size: 11px; color: #57534E; margin-bottom: 6px;">
              ${stop.location}
            </div>
            <div style="border-top: 1px solid #E7E5E4; padding-top: 6px; margin-top: 4px; font-size: 10px; color: #44403C; space-y: 2px;">
              <div><strong>Material/Food:</strong> ${stop.materialOrFood}</div>
              <div><strong>Urgency:</strong> ${stop.urgency}</div>
              ${stop.contactPerson ? `<div><strong>Contact:</strong> ${stop.contactPerson} (${stop.contactPhone || ''})</div>` : ''}
              ${stop.estimatedArrivalMin ? `<div><strong>Est. Arrival:</strong> +${stop.estimatedArrivalMin} mins from dispatch</div>` : ''}
            </div>
          </div>
        `);

        routeGroup.addLayer(destMarker);
        bounds.extend(stop.coordinates);
      });
    }

    // 3. ADD SURROUNDING ECOSYSTEM MARKERS (NEARBY NGOs & NEARBY BUYERS)
    // "Nearby organizations must NOT automatically become route stops. They are only shown as the surrounding recovery ecosystem."
    if (showNearbyMarkers) {
      // Nearby Receivers (Amber/Orange)
      nearbyReceivers.forEach((entity) => {
        // Skip if already in the active route stops to avoid duplicate overlapping markers
        const isAlreadyStop = routeData?.stops.some((s) => s.coordinates[0] === entity.coordinates[0] && s.coordinates[1] === entity.coordinates[1]);
        if (isAlreadyStop) return;

        const ecoRecIconHtml = `
          <div class="relative flex items-center justify-center cursor-pointer group" title="${entity.name} (Nearby ${entity.type})">
            <div class="w-6 h-6 rounded-full bg-[#F97316] border border-white shadow-md flex items-center justify-center text-white text-[9px] font-bold opacity-85 hover:opacity-100 transition-opacity">
              ●
            </div>
          </div>
        `;

        const ecoMarker = L.marker(entity.coordinates, {
          icon: createDivIcon(ecoRecIconHtml, 'eco-rec-marker', [24, 24]),
          zIndexOffset: 100,
        }).bindPopup(`
          <div style="font-family: inherit; font-size: 11px; line-height: 1.4; color: #161A18; min-width: 220px; padding: 4px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; background: rgba(249,115,22,0.15); color: #EA580C; font-weight: 700; font-size: 9px; text-transform: uppercase;">
                ${entity.type}
              </span>
              <span style="font-size: 8px; font-weight: 700; color: #A8A29E; background: #F5F5F4; padding: 1px 4px; border-radius: 4px;">
                DEMO / SYNTHETIC
              </span>
            </div>
            <div style="font-weight: 700; font-size: 12px; color: #0C2D21; margin-bottom: 2px;">
              ${entity.name}
            </div>
            <div style="font-size: 10px; color: #57534E; margin-bottom: 4px;">
              📍 ${entity.location} · <strong>${entity.distanceKm} km away</strong>
            </div>
            <div style="font-size: 10px; color: #059669; font-weight: 600;">
              Status: ${entity.availabilityStatus}
            </div>
            <div style="margin-top: 6px; padding: 4px 6px; background: #FAF8F3; border-radius: 4px; font-size: 9px; color: #78716C; font-style: italic;">
              * Nearby ecosystem partner (Not an active route stop)
            </div>
          </div>
        `);

        ecoGroup.addLayer(ecoMarker);
        bounds.extend(entity.coordinates);
      });

      // Nearby Industries & Buyers (Indigo/Blue)
      nearbyIndustries.forEach((entity) => {
        const isAlreadyStop = routeData?.stops.some((s) => s.coordinates[0] === entity.coordinates[0] && s.coordinates[1] === entity.coordinates[1]);
        if (isAlreadyStop) return;

        const ecoIndIconHtml = `
          <div class="relative flex items-center justify-center cursor-pointer group" title="${entity.name} (Nearby ${entity.type})">
            <div class="w-6 h-6 rounded-full bg-[#3B82F6] border border-white shadow-md flex items-center justify-center text-white text-[9px] font-bold opacity-85 hover:opacity-100 transition-opacity">
              ■
            </div>
          </div>
        `;

        const ecoMarker = L.marker(entity.coordinates, {
          icon: createDivIcon(ecoIndIconHtml, 'eco-ind-marker', [24, 24]),
          zIndexOffset: 100,
        }).bindPopup(`
          <div style="font-family: inherit; font-size: 11px; line-height: 1.4; color: #161A18; min-width: 220px; padding: 4px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.15); color: #2563EB; font-weight: 700; font-size: 9px; text-transform: uppercase;">
                ${entity.type}
              </span>
              <span style="font-size: 8px; font-weight: 700; color: #A8A29E; background: #F5F5F4; padding: 1px 4px; border-radius: 4px;">
                DEMO / SYNTHETIC
              </span>
            </div>
            <div style="font-weight: 700; font-size: 12px; color: #0C2D21; margin-bottom: 2px;">
              ${entity.name}
            </div>
            <div style="font-size: 10px; color: #57534E; margin-bottom: 4px;">
              📍 ${entity.location} · <strong>${entity.distanceKm} km away</strong>
            </div>
            <div style="font-size: 10px; color: #2563EB; font-weight: 600;">
              Demand: ${entity.availabilityStatus}
            </div>
            <div style="margin-top: 6px; padding: 4px 6px; background: #FAF8F3; border-radius: 4px; font-size: 9px; color: #78716C; font-style: italic;">
              * Surrounding industrial recovery entity (Not an active route stop)
            </div>
          </div>
        `);

        ecoGroup.addLayer(ecoMarker);
        bounds.extend(entity.coordinates);
      });
    }

    // Fit map view to bounds with padding
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [45, 45], maxZoom: 14 });
    }
  }, [routeData, showNearbyMarkers]);

  // Center on a specific entity when clicked from ecosystem panel
  const handleFocusEntityOnMap = (entity: NearbyEcosystemEntity) => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView(entity.coordinates, 14, { animate: true });
    setSelectedEntityForDetails(entity);
  };

  const resetMapView = () => {
    if (!mapInstanceRef.current || !routeData) return;
    const bounds = L.latLngBounds([providerCoords, ...routeData.stops.map((s) => s.coordinates)]);
    if (bounds.isValid()) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [45, 45], maxZoom: 14 });
    }
  };

  // Find accepted listings for current flow
  const targetCategoryType = activeFlow === 'FOOD_RECOVERY' ? 'FOOD_SURPLUS' : 'RESOURCE_BYPRODUCT';
  const acceptedListingsForFlow = allListings.filter((l) => {
    const isAccepted =
      l.status === 'ACCEPTED' ||
      l.status === 'PICKUP_INITIATED' ||
      l.status === 'PICKED_UP' ||
      l.status === 'DELIVERED';
    return l.type === targetCategoryType && isAccepted && !!l.matchedEntity;
  });

  const hasAcceptedRecoveries = acceptedListingsForFlow.length > 0;
  const isMultipleStops = (routeData?.stops.length || 0) > 1;

  // Single active accepted recovery summary (for primary single view)
  const primaryStop = routeData?.stops[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header & Flow Selector: [ FOOD RECOVERY ] & [ RESOURCE RECOVERY ] */}
      <div className="bg-white border border-[#0C2D21]/15 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#0C2D21]/10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0C2D21]/5 text-xs font-bold text-[#0C2D21] uppercase tracking-wider">
                <Navigation className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Transportation & Logistics Intelligence</span>
              </span>
              <span className="text-stone-300">·</span>
              <span className="text-xs font-mono font-semibold text-stone-500">
                W2V Route Engine v2.4
              </span>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0C2D21] tracking-tight uppercase">
              MAP ANALYTICS & ROUTE OPTIMIZATION
            </h1>
            <p className="text-xs sm:text-sm text-[#161A18]/75 mt-1 max-w-2xl leading-relaxed">
              Automated road routing and multi-stop logistics optimization activated upon recipient acceptance. Connects kitchen surplus directly with local shelters and industrial circularity buyers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onBackToDashboard}
              className="px-4 py-2.5 rounded-xl border border-[#0C2D21]/20 text-xs font-bold uppercase tracking-wider text-[#0C2D21] bg-white hover:bg-stone-50 transition-colors cursor-pointer"
            >
              ← BACK TO DASHBOARD
            </button>
          </div>
        </div>

        {/* FLOW TOGGLE: FOOD RECOVERY vs RESOURCE RECOVERY (Do NOT mix flows) */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 p-1.5 bg-[#FAF8F3] border border-[#0C2D21]/15 rounded-2xl w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                setActiveFlow('FOOD_RECOVERY');
                setSelectedSingleListingId(null);
              }}
              className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeFlow === 'FOOD_RECOVERY'
                  ? 'bg-[#0C2D21] text-white shadow-sm'
                  : 'text-stone-600 hover:text-[#0C2D21]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
              <span>FOOD RECOVERY</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveFlow('RESOURCE_RECOVERY');
                setSelectedSingleListingId(null);
              }}
              className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeFlow === 'RESOURCE_RECOVERY'
                  ? 'bg-[#0C2D21] text-white shadow-sm'
                  : 'text-stone-600 hover:text-[#0C2D21]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#F97316]"></span>
              <span>RESOURCE RECOVERY</span>
            </button>
          </div>

          {/* Flow Pipeline Indicator */}
          <div className="text-[11px] text-stone-500 font-mono flex items-center gap-1.5 bg-stone-50 px-3.5 py-2 rounded-xl border border-stone-200">
            {activeFlow === 'FOOD_RECOVERY' ? (
              <span>Institutional Kitchen → Food Recovery → NGO / Shelter → <strong className="text-[#059669]">Accepted</strong> → Route Ready</span>
            ) : (
              <span>Institutional Kitchen → Resource Recovery → Secondary Buyer / Industry → <strong className="text-[#059669]">Accepted</strong> → Route Ready</span>
            )}
          </div>
        </div>
      </div>

      {/* Notice if No Accepted Recoveries in Selected Flow */}
      {!hasAcceptedRecoveries && (
        <div className="p-6 rounded-3xl bg-amber-50 border border-amber-200 text-[#0C2D21] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-sm text-amber-900">
                Route Inactive — Awaiting Recipient Acceptance
              </h3>
              <p className="text-xs text-amber-800 mt-0.5">
                Per W2V logistics protocols, routes remain dormant until a registered receiver or industrial buyer accepts the recovery offer. Once accepted, transit routes activate automatically with live telemetry.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              // Switch to the other flow where accepted records exist
              setActiveFlow(activeFlow === 'FOOD_RECOVERY' ? 'RESOURCE_RECOVERY' : 'FOOD_RECOVERY');
            }}
            className="px-4 py-2 rounded-xl bg-[#0C2D21] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#144432] transition-colors cursor-pointer shrink-0"
          >
            Switch to {activeFlow === 'FOOD_RECOVERY' ? 'Resource Recovery' : 'Food Recovery'}
          </button>
        </div>
      )}

      {/* MAIN TWO-COLUMN LAYOUT: LEFT ANALYTICS PANEL & RIGHT MAP */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ======================================================== */}
        {/* LEFT COLUMN: MAP ANALYTICS PANEL & NEARBY ECOSYSTEM */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* SECTION 4: MAP ANALYTICS PANEL */}
          <div className="bg-white border border-[#0C2D21]/15 rounded-3xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#0C2D21]/10">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-[#10B981]" />
                <h2 className="font-display text-base font-extrabold text-[#0C2D21] uppercase tracking-tight">
                  MAP ANALYTICS
                </h2>
              </div>

              {/* ROUTE STATUS BADGE */}
              {routeData?.status === 'ROUTE_READY' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10B981]/15 text-[#059669] text-xs font-extrabold uppercase tracking-wider animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
                  <span>ROUTE READY</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-600 text-xs font-bold uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5" />
                  <span>AWAITING ACCEPTANCE</span>
                </span>
              )}
            </div>

            {/* Core Metrics Summary Grid */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-stone-100">
                <span className="text-stone-500 font-semibold">Recovery Type:</span>
                <span className="font-bold text-[#0C2D21]">
                  {activeFlow === 'FOOD_RECOVERY' ? 'Food Recovery (Surplus Redistribution)' : 'Resource Recovery (Industrial Byproduct)'}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-stone-100">
                <span className="text-stone-500 font-semibold">Provider:</span>
                <span className="font-bold text-[#0C2D21] text-right truncate max-w-[220px]" title={providerName}>
                  {providerName}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-stone-100">
                <span className="text-stone-500 font-semibold">Accepted By:</span>
                <span className="font-bold text-[#059669] text-right truncate max-w-[220px]" title={primaryStop?.acceptedEntityName || 'Awaiting acceptance'}>
                  {isMultipleStops ? `${routeData?.stops.length} Verified Recipients` : primaryStop?.acceptedEntityName || 'Awaiting match'}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-stone-100">
                <span className="text-stone-500 font-semibold">Material / Food:</span>
                <span className="font-bold text-[#0C2D21] text-right truncate max-w-[220px]">
                  {primaryStop?.materialOrFood || 'N/A'}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-stone-100">
                <span className="text-stone-500 font-semibold">Quantity:</span>
                <span className="font-mono font-bold text-[#0C2D21]">
                  {routeData?.totalLoadKg || 0} kg
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-stone-100">
                <span className="text-stone-500 font-semibold">Road Distance:</span>
                <span className="font-mono font-bold text-[#0C2D21] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#F97316]" />
                  <span>{routeData?.totalDistanceKm || 0} km</span>
                </span>
              </div>

              <div className="flex justify-between py-1.5">
                <span className="text-stone-500 font-semibold">Estimated Travel Time:</span>
                <span className="font-mono font-bold text-[#059669] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#059669]" />
                  <span>~{routeData?.totalTravelTimeMin || 0} mins</span>
                </span>
              </div>
            </div>

            {/* SECTION 7: MULTIPLE ACCEPTED RECOVERIES STOP SEQUENCE */}
            {routeData && routeData.stops.length > 0 && (
              <div className="pt-4 border-t border-[#0C2D21]/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                    {isMultipleStops ? 'CONSOLIDATED STOP SEQUENCE' : 'DIRECT TRANSIT SEQUENCE'}
                  </span>
                  {acceptedListingsForFlow.length > 1 && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setRouteMode(routeMode === 'AUTO_CONSOLIDATED' ? 'SINGLE_SELECTION' : 'AUTO_CONSOLIDATED');
                          if (routeMode === 'AUTO_CONSOLIDATED' && acceptedListingsForFlow.length > 0) {
                            setSelectedSingleListingId(acceptedListingsForFlow[0].id);
                          }
                        }}
                        className="text-[10px] font-bold text-[#059669] hover:underline cursor-pointer"
                      >
                        {routeMode === 'AUTO_CONSOLIDATED' ? 'Switch to Single Stop' : 'Optimize All Stops'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Timeline Sequence */}
                <div className="p-3.5 rounded-2xl bg-[#FAF8F3] border border-[#0C2D21]/10 space-y-3 text-xs">
                  {/* START: Provider */}
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#0C2D21] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      S
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-stone-400 block">
                        START · PICKUP LOCATION
                      </span>
                      <strong className="text-[#0C2D21] block truncate">{providerName}</strong>
                      <span className="text-stone-500 text-[11px] block truncate">{providerLocation}</span>
                    </div>
                  </div>

                  {/* STOPS */}
                  {routeData.stops.map((stop, sIdx) => (
                    <div key={stop.id} className="relative pl-3 border-l-2 border-dashed border-[#10B981] ml-3 space-y-2 py-1">
                      <div className="flex items-start gap-3 -ml-6">
                        <div className="w-6 h-6 rounded-full bg-[#10B981] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 shadow-xs">
                          {isMultipleStops ? sIdx + 1 : '1'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-[#059669]">
                              {isMultipleStops ? `STOP ${sIdx + 1}` : 'DESTINATION'} · {stop.quantityKg} kg
                            </span>
                            {stop.travelTimeFromPrevMin && (
                              <span className="text-[10px] font-mono text-stone-500">
                                +{stop.travelTimeFromPrevMin} min
                              </span>
                            )}
                          </div>
                          <strong className="text-[#0C2D21] block truncate">{stop.name}</strong>
                          <span className="text-stone-500 text-[11px] block truncate">{stop.location}</span>
                          <span className="text-[10px] text-stone-600 block mt-0.5">
                            Item: {stop.materialOrFood} ({stop.urgency} priority)
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* END */}
                  <div className="flex items-start gap-3 pt-1">
                    <div className="w-6 h-6 rounded-full bg-[#059669] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      ✓
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-stone-400 block">
                        END · DELIVERY FULFILLED
                      </span>
                      <span className="text-[#059669] font-semibold text-[11px] block">
                        Zero Landfill Transfer Complete
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* OPTIMIZATION FACTORS (Only displaying factors that actually have data) */}
            <div className="pt-4 border-t border-[#0C2D21]/10 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  OPTIMIZATION FACTORS
                </span>
                <span className="text-[10px] font-mono text-stone-400">
                  Calculated from telemetry & listings
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {routeData?.optimizationFactors
                  .filter((f) => f.hasData)
                  .map((factor, fIdx) => (
                    <div
                      key={fIdx}
                      className="p-2.5 rounded-xl bg-[#FAF8F3] border border-[#0C2D21]/8 flex items-start gap-2"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] font-bold text-stone-500 uppercase block">
                          {factor.label}
                        </span>
                        <span className="font-semibold text-[#0C2D21] text-[11px] block">
                          {factor.value}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* SECTION 5: NEARBY RECOVERY ECOSYSTEM */}
          {/* ======================================================== */}
          <div className="bg-white border border-[#0C2D21]/15 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#0C2D21]/10">
              <div>
                <h3 className="font-display text-sm font-extrabold text-[#0C2D21] uppercase tracking-tight">
                  NEARBY RECOVERY ECOSYSTEM
                </h3>
                <p className="text-[11px] text-stone-500">
                  Surrounding community network (Shown for context; not automatic route stops).
                </p>
              </div>

              <label className="flex items-center gap-1.5 text-xs text-stone-600 cursor-pointer self-start sm:self-auto select-none">
                <input
                  type="checkbox"
                  checked={showNearbyMarkers}
                  onChange={(e) => setShowNearbyMarkers(e.target.checked)}
                  className="rounded text-[#0C2D21] focus:ring-[#0C2D21] cursor-pointer"
                />
                <span className="text-[11px] font-bold">Show on Map</span>
              </label>
            </div>

            {/* TWO TABS: [ NGOs & RECEIVERS ] and [ INDUSTRIES & BUYERS ] */}
            <div className="flex items-center gap-2 p-1 bg-[#FAF8F3] rounded-xl border border-stone-200 text-xs">
              <button
                type="button"
                onClick={() => setEcosystemTab('RECEIVERS')}
                className={`flex-1 py-2 rounded-lg font-bold uppercase tracking-wider text-center transition-all cursor-pointer ${
                  ecosystemTab === 'RECEIVERS'
                    ? 'bg-[#0C2D21] text-white shadow-xs'
                    : 'text-stone-600 hover:text-[#0C2D21]'
                }`}
              >
                NGOs & RECEIVERS ({nearbyReceivers.length})
              </button>

              <button
                type="button"
                onClick={() => setEcosystemTab('BUYERS')}
                className={`flex-1 py-2 rounded-lg font-bold uppercase tracking-wider text-center transition-all cursor-pointer ${
                  ecosystemTab === 'BUYERS'
                    ? 'bg-[#0C2D21] text-white shadow-xs'
                    : 'text-stone-600 hover:text-[#0C2D21]'
                }`}
              >
                INDUSTRIES & BUYERS ({nearbyIndustries.length})
              </button>
            </div>

            {/* Entity List */}
            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
              {(ecosystemTab === 'RECEIVERS' ? nearbyReceivers : nearbyIndustries).map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleFocusEntityOnMap(item)}
                  className="p-3.5 rounded-2xl bg-[#FAF8F3] hover:bg-[#F2ECE1] border border-[#0C2D21]/10 transition-all cursor-pointer space-y-1.5 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                            item.category === 'RECEIVER'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {item.type}
                        </span>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-stone-200/80 text-stone-600">
                          {item.label}
                        </span>
                      </div>
                      <h4 className="font-display text-xs font-bold text-[#0C2D21] mt-1 group-hover:text-[#059669] transition-colors truncate">
                        {item.name}
                      </h4>
                    </div>

                    <span className="text-xs font-mono font-extrabold text-[#0C2D21] shrink-0">
                      {item.distanceKm} km
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-stone-500">
                    <span className="truncate">📍 {item.location}</span>
                    <span className="font-semibold text-[#059669] shrink-0 text-[10px]">
                      {item.availabilityStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-[11px] text-stone-600 italic">
              <strong>Notice:</strong> Prototype entities are strictly labeled <strong>DEMO / SYNTHETIC</strong>. They reflect the surrounding circular economy network and do not modify existing dispatch routes.
            </div>
          </div>

        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: MAIN INTERACTIVE MAP SCREEN */}
        {/* ======================================================== */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="bg-white border border-[#0C2D21]/15 rounded-3xl p-4 shadow-sm relative">
            
            {/* Map Header Overlay Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#0C2D21] text-white rounded-2xl mb-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <Compass className="w-4 h-4 text-[#10B981]" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-white">
                      AI-OPTIMIZED ROUTE
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-[#34D399] font-mono">
                      {routeData?.routingMode || 'Road Network Routing'}
                    </span>
                  </div>
                  <span className="text-[10px] text-stone-300 block">
                    {routeData?.routingMode ? routeData.routingMode : 'Route optimized based on road distance.'}
                  </span>
                </div>
              </div>

              {/* Dynamic Stats Badges */}
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 rounded-xl bg-white/10 text-right">
                  <span className="text-[9px] uppercase tracking-wider text-stone-300 block">Distance</span>
                  <span className="font-mono font-black text-sm text-[#34D399]">
                    {routeData?.totalDistanceKm || 0} km
                  </span>
                </div>

                <div className="px-3 py-1 rounded-xl bg-white/10 text-right">
                  <span className="text-[9px] uppercase tracking-wider text-stone-300 block">Est. Time</span>
                  <span className="font-mono font-black text-sm text-white">
                    ~{routeData?.totalTravelTimeMin || 0} min
                  </span>
                </div>

                <button
                  type="button"
                  onClick={resetMapView}
                  title="Fit route to screen"
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Map Canvas Container */}
            <div
              ref={mapContainerRef}
              className="w-full h-[580px] rounded-2xl overflow-hidden border border-stone-200 z-10"
              style={{ minHeight: '520px' }}
            />

            {/* Loading Indicator Overlay */}
            {isLoadingRoute && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-2xs flex items-center justify-center z-30 rounded-3xl">
                <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#0C2D21] text-white shadow-xl">
                  <RefreshCw className="w-4 h-4 animate-spin text-[#10B981]" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Calculating AI-Optimized Road Route...
                  </span>
                </div>
              </div>
            )}

            {/* SECTION 6: MAP LEGEND (Fixed on bottom right corner of map canvas) */}
            <div className="mt-3 p-3.5 bg-[#FAF8F3] border border-[#0C2D21]/10 rounded-2xl flex flex-wrap items-center justify-between gap-4 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                MAP MARKER LEGEND:
              </span>

              <div className="flex flex-wrap items-center gap-4 text-[11px]">
                {/* Provider Marker */}
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#0C2D21] border border-white shadow-2xs"></span>
                  <span className="font-bold text-[#0C2D21]">PROVIDER / PICKUP</span>
                </div>

                {/* Accepted Destination */}
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#10B981] border border-white shadow-2xs"></span>
                  <span className="font-bold text-[#059669]">ACCEPTED DESTINATION</span>
                </div>

                {/* Nearby Receiver */}
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#F97316]"></span>
                  <span className="text-stone-700">NEARBY NGO / RECEIVER</span>
                </div>

                {/* Nearby Industry */}
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-[#3B82F6]"></span>
                  <span className="text-stone-700">NEARBY INDUSTRY / BUYER</span>
                </div>
              </div>
            </div>

            {/* Route Detail Card Footer */}
            {primaryStop && (
              <div className="mt-3 p-4 rounded-2xl bg-white border border-[#0C2D21]/10 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                    <span className="font-bold text-[#0C2D21]">
                      Active Mission: {primaryStop.name}
                    </span>
                  </div>
                  <p className="text-stone-500 text-[11px] mt-0.5">
                    Coordinated via W2V Logistics Protocol. Handover receipt and ESG digital certificate generated on arrival.
                  </p>
                </div>

                {primaryStop.contactPhone && (
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-3 py-1.5 rounded-xl bg-stone-100 font-mono font-bold text-[#0C2D21]">
                      📞 {primaryStop.contactPhone}
                    </span>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};
