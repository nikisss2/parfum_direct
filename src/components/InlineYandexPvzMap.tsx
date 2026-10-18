import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  MapPin,
  Clock,
  Check,
  Layers,
  ShieldCheck,
  Navigation,
} from 'lucide-react';
import {
  PvzPoint,
  POPULAR_RUSSIAN_CITIES,
  INITIAL_PVZ_DATABASE,
} from '../data/pvzData';

declare global {
  interface Window {
    ymaps?: any;
    _ymapsLoadingPromise?: Promise<any>;
  }
}

interface InlineYandexPvzMapProps {
  onSelectPvz: (pvz: PvzPoint) => void;
  selectedPvz?: PvzPoint | null;
  activeCity?: string;
  onCityChange?: (city: string) => void;
}

export const InlineYandexPvzMap: React.FC<InlineYandexPvzMapProps> = ({
  onSelectPvz,
  selectedPvz,
  activeCity = 'Москва',
  onCityChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [networkFilter, setNetworkFilter] = useState<'all' | 'yandex' | 'cdek' | 'boxberry' | 'fivepost'>('all');
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [points] = useState<PvzPoint[]>(INITIAL_PVZ_DATABASE);
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const clustererRef = useRef<any>(null);

  // Filter points according to city, search query, and network
  const filteredPoints = points.filter(p => {
    if (networkFilter !== 'all' && p.network !== networkFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchCity = p.city.toLowerCase().includes(q);
      const matchAddress = p.address.toLowerCase().includes(q);
      const matchName = p.name.toLowerCase().includes(q);
      const matchMetro = p.metro?.toLowerCase().includes(q);
      return matchCity || matchAddress || matchName || matchMetro;
    }
    if (activeCity) {
      return p.city.toLowerCase() === activeCity.toLowerCase();
    }
    return true;
  });

  // Load Yandex Maps API once
  useEffect(() => {
    function loadYmapsScript(): Promise<any> {
      if (window.ymaps) return Promise.resolve(window.ymaps);
      if (window._ymapsLoadingPromise) return window._ymapsLoadingPromise;

      window._ymapsLoadingPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU';
        script.async = true;
        script.onload = () => {
          if (window.ymaps) {
            window.ymaps.ready(() => resolve(window.ymaps));
          } else {
            reject(new Error('Ymaps failed to load'));
          }
        };
        script.onerror = () => reject(new Error('Ymaps network blocked'));
        document.head.appendChild(script);
      });
      return window._ymapsLoadingPromise;
    }

    loadYmapsScript()
      .then(ymaps => {
        initMap(ymaps);
      })
      .catch(err => {
        console.warn('Yandex Maps fallback mode active:', err);
        setMapError('Карта загружается в резервном режиме. Доступен полный список ПВЗ с поиском.');
        setViewMode('list');
      });

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.destroy();
        } catch {
          // ignore
        }
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update placemarks whenever filteredPoints changes
  useEffect(() => {
    if (window.ymaps && mapInstanceRef.current && isMapReady) {
      renderPlacemarks(window.ymaps, mapInstanceRef.current);
    }
  }, [filteredPoints.length, networkFilter, searchQuery, isMapReady]);

  // Center map when city changes
  useEffect(() => {
    if (mapInstanceRef.current && window.ymaps && activeCity) {
      const cityMeta = POPULAR_RUSSIAN_CITIES.find(
        c => c.name.toLowerCase() === activeCity.toLowerCase()
      );
      if (cityMeta) {
        mapInstanceRef.current.setCenter([cityMeta.lat, cityMeta.lng], 12, { duration: 300 });
      }
    }
  }, [activeCity]);

  const initMap = (ymaps: any) => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.destroy();
      } catch {}
      mapInstanceRef.current = null;
    }

    const cityMeta = POPULAR_RUSSIAN_CITIES.find(
      c => c.name.toLowerCase() === (activeCity || 'москва').toLowerCase()
    ) || { lat: 55.7558, lng: 37.6173 };

    try {
      const map = new ymaps.Map(
        mapContainerRef.current,
        {
          center: [cityMeta.lat, cityMeta.lng],
          zoom: 12,
          controls: ['zoomControl', 'geolocationControl'],
        },
        {
          suppressMapOpenBlock: true,
        }
      );

      mapInstanceRef.current = map;
      setIsMapReady(true);
      renderPlacemarks(ymaps, map);
    } catch (e) {
      console.warn('Error creating map instance', e);
      setViewMode('list');
    }
  };

  const renderPlacemarks = (ymaps: any, map: any) => {
    if (!map || !ymaps) return;

    if (clustererRef.current) {
      map.geoObjects.remove(clustererRef.current);
    }

    const clusterer = new ymaps.Clusterer({
      preset: 'islands#invertedBlackClusterIcons',
      groupByCoordinates: false,
      clusterDisableClickZoom: false,
      clusterHideIconOnBalloonOpen: false,
      geoObjectHideIconOnBalloonOpen: false,
    });

    const marks = filteredPoints.map(p => {
      let iconColor = '#000000';
      if (p.network === 'yandex') iconColor = '#f59e0b';
      if (p.network === 'cdek') iconColor = '#10b981';
      if (p.network === 'boxberry') iconColor = '#8b5cf6';
      if (p.network === 'fivepost') iconColor = '#f97316';

      const isCurrent = selectedPvz?.id === p.id;

      const placemark = new ymaps.Placemark(
        [p.lat, p.lng],
        {
          balloonContentHeader: `<div style="font-family:serif;font-size:14px;font-weight:bold;color:#000;">${p.name}</div>`,
          balloonContentBody: `
            <div style="font-size:12px;color:#333;line-height:1.4;margin-top:4px;">
              <div style="font-weight:600;color:#000;">${p.address}</div>
              ${p.metro ? `<div style="color:#666;font-size:11px;margin-top:2px;">Метро: ${p.metro}</div>` : ''}
              <div style="margin-top:4px;font-size:11px;color:#555;">График: ${p.workTime}</div>
              <div style="margin-top:2px;font-weight:bold;color:#10b981;">Доставка: ${p.deliveryDays} · от 50 ₽</div>
            </div>
          `,
          balloonContentFooter: `
            <button id="inline-pvz-btn-${p.id}" style="margin-top:8px;padding:7px 12px;background:#000;color:#fff;border:none;font-size:11px;font-weight:bold;cursor:pointer;width:100%;text-transform:uppercase;letter-spacing:1px;">
              Выбрать этот пункт выдачи
            </button>
          `,
          hintContent: `${p.networkName} — ${p.name}`,
        },
        {
          preset: isCurrent ? 'islands#redDotIcon' : 'islands#dotIcon',
          iconColor: isCurrent ? '#dc2626' : iconColor,
        }
      );

      placemark.events.add('click', () => {
        onSelectPvz(p);
      });

      placemark.events.add('balloonopen', () => {
        setTimeout(() => {
          const btn = document.getElementById(`inline-pvz-btn-${p.id}`);
          if (btn) {
            btn.onclick = () => {
              onSelectPvz(p);
              map.balloon.close();
            };
          }
        }, 50);
      });

      return placemark;
    });

    clusterer.add(marks);
    clustererRef.current = clusterer;
    map.geoObjects.add(clusterer);
  };

  const handlePickPoint = (p: PvzPoint) => {
    onSelectPvz(p);
    if (mapInstanceRef.current && window.ymaps) {
      mapInstanceRef.current.setCenter([p.lat, p.lng], 16, { duration: 300 });
    }
  };

  return (
    <div className="border border-zinc-300 bg-white overflow-hidden space-y-0 shadow-xs">
      {/* Map Header with Filters */}
      <div className="p-3.5 bg-zinc-950 text-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-amber-400 text-black flex items-center justify-center font-bold text-xs">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span>Интерактивная карта ПВЗ</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-amber-400 text-black font-bold">
                {filteredPoints.length} точек
              </span>
            </div>
            <div className="text-[11px] text-zinc-400 font-light">
              Яндекс Доставка · СДЭК · Boxberry · 5POST (по всей России и СНГ)
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('map')}
            className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
              viewMode === 'map'
                ? 'bg-amber-400 text-black'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            Карта
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
              viewMode === 'list'
                ? 'bg-amber-400 text-black'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            Списком ({filteredPoints.length})
          </button>
        </div>
      </div>

      {/* Search and Network Filter Controls */}
      <div className="p-3 bg-zinc-50 border-b border-zinc-200 space-y-2.5">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Поиск по улице, метро или адресу (напр. Тверская, Арбат)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full text-xs px-3.5 py-2 pl-9 bg-white border border-zinc-300 outline-none focus:border-black text-zinc-900"
            />
            <Search className="w-4 h-4 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>

          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="px-3 py-2 text-xs bg-zinc-200 text-zinc-700 hover:bg-zinc-300 transition-colors uppercase font-bold text-[10px]"
            >
              Сброс
            </button>
          )}
        </div>

        {/* Network Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {[
            { id: 'all', label: 'Все сети', count: points.length, color: 'bg-zinc-900 text-white' },
            { id: 'yandex', label: 'Яндекс Маркет', count: points.filter(p => p.network === 'yandex').length, color: 'bg-amber-500 text-black' },
            { id: 'cdek', label: 'СДЭК', count: points.filter(p => p.network === 'cdek').length, color: 'bg-emerald-600 text-white' },
            { id: 'boxberry', label: 'Boxberry', count: points.filter(p => p.network === 'boxberry').length, color: 'bg-purple-600 text-white' },
            { id: 'fivepost', label: '5POST (Пятерочка)', count: points.filter(p => p.network === 'fivepost').length, color: 'bg-orange-500 text-white' },
          ].map(net => {
            const active = networkFilter === net.id;
            return (
              <button
                key={net.id}
                type="button"
                onClick={() => setNetworkFilter(net.id as any)}
                className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-all border ${
                  active
                    ? 'border-black bg-black text-white'
                    : 'border-zinc-300 bg-white text-zinc-700 hover:border-black'
                }`}
              >
                {net.label} ({net.count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Map or List Container */}
      <div className="relative">
        <div
          ref={mapContainerRef}
          className={`w-full h-[380px] sm:h-[430px] bg-zinc-100 ${
            viewMode === 'list' ? 'hidden' : 'block'
          }`}
        />

        {/* List View */}
        {viewMode === 'list' && (
          <div className="w-full h-[380px] sm:h-[430px] overflow-y-auto divide-y divide-zinc-200 bg-white">
            {filteredPoints.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-400 font-mono">
                Пунктов выдачи по запросу «{searchQuery}» не найдено. Попробуйте изменить запрос.
              </div>
            ) : (
              filteredPoints.map(p => {
                const isCurrent = selectedPvz?.id === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => handlePickPoint(p)}
                    className={`p-3 sm:p-4 transition-colors cursor-pointer flex items-center justify-between gap-3 ${
                      isCurrent
                        ? 'bg-amber-50/80 border-l-4 border-black'
                        : 'hover:bg-zinc-50'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] font-mono uppercase px-1.5 py-0.5 font-bold ${
                            p.network === 'yandex'
                              ? 'bg-amber-400 text-black'
                              : p.network === 'cdek'
                              ? 'bg-emerald-600 text-white'
                              : p.network === 'boxberry'
                              ? 'bg-purple-600 text-white'
                              : 'bg-orange-500 text-white'
                          }`}
                        >
                          {p.networkName}
                        </span>
                        <span className="font-bold text-xs text-zinc-950 truncate">
                          {p.name}
                        </span>
                      </div>
                      <div className="text-xs text-zinc-700 mt-1 font-medium">{p.address}</div>
                      {p.metro && (
                        <div className="text-[11px] text-zinc-400 mt-0.5 flex items-center gap-1">
                          <span>🚇 {p.metro}</span>
                        </div>
                      )}
                      <div className="text-[10px] text-zinc-500 mt-0.5 font-mono">
                        График: {p.workTime} · Срок: {p.deliveryDays}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        handlePickPoint(p);
                      }}
                      className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider shrink-0 transition-colors ${
                        isCurrent
                          ? 'bg-black text-white'
                          : 'bg-zinc-100 hover:bg-black hover:text-white text-zinc-900 border border-zinc-300'
                      }`}
                    >
                      {isCurrent ? 'Выбран ✓' : 'Выбрать'}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Selected Point Status Bar */}
      {selectedPvz ? (
        <div className="p-3 bg-zinc-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                Выбран пункт выдачи:
              </span>
              <span className="text-xs font-bold text-white truncate">
                {selectedPvz.networkName} — {selectedPvz.name}
              </span>
            </div>
            <div className="text-xs text-zinc-300 truncate mt-0.5 font-mono">
              📍 {selectedPvz.address} ({selectedPvz.workTime})
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 text-[10px] font-mono text-zinc-400">
            <span>Доставка от 50 ₽ · {selectedPvz.deliveryDays}</span>
          </div>
        </div>
      ) : (
        <div className="p-2.5 bg-zinc-100 text-zinc-600 text-[11px] flex items-center gap-2 border-t border-zinc-200">
          <Navigation className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
          <span>Кликните по любой точке на карте или выберите пункт из списка для доставки.</span>
        </div>
      )}
    </div>
  );
};
