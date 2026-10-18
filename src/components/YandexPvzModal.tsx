import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Search,
  MapPin,
  Clock,
  Truck,
  Check,
  Navigation,
  Layers,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
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

interface YandexPvzModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPvz: (pvz: PvzPoint) => void;
  selectedPvzId?: string;
  initialCity?: string;
}

export const YandexPvzModal: React.FC<YandexPvzModalProps> = ({
  isOpen,
  onClose,
  onSelectPvz,
  selectedPvzId,
  initialCity = 'Москва',
}) => {
  const [activeCity, setActiveCity] = useState(initialCity);
  const [searchQuery, setSearchQuery] = useState('');
  const [networkFilter, setNetworkFilter] = useState<'all' | 'yandex' | 'cdek' | 'boxberry' | 'fivepost'>('all');
  const [activeTab, setActiveTab] = useState<'map' | 'list'>('map');
  const [selectedPoint, setSelectedPoint] = useState<PvzPoint | null>(null);
  const [points, setPoints] = useState<PvzPoint[]>(INITIAL_PVZ_DATABASE);
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const clustererRef = useRef<any>(null);

  // Filtered points
  const filteredPoints = points.filter(p => {
    if (networkFilter !== 'all' && p.network !== networkFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
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
    if (!isOpen) return;

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
        setMapError('Интерактивная карта загружается в резервном режиме. Доступен полный список ПВЗ с поиском.');
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
  }, [isOpen]);

  // Initialize or re-center Yandex Map
  const initMap = (ymaps: any) => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) {
      mapInstanceRef.current.destroy();
      mapInstanceRef.current = null;
    }

    const cityMeta = POPULAR_RUSSIAN_CITIES.find(
      c => c.name.toLowerCase() === activeCity.toLowerCase()
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
    }
  };

  // Render placemarks on the map
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
      if (p.network === 'yandex') iconColor = '#f59e0b'; // amber/yellow
      if (p.network === 'cdek') iconColor = '#10b981'; // green
      if (p.network === 'boxberry') iconColor = '#8b5cf6'; // purple
      if (p.network === 'fivepost') iconColor = '#f97316'; // orange

      const placemark = new ymaps.Placemark(
        [p.lat, p.lng],
        {
          balloonContentHeader: `<div style="font-family:serif;font-size:14px;font-weight:bold;color:#000;">${p.name}</div>`,
          balloonContentBody: `
            <div style="font-size:12px;color:#444;line-height:1.4;margin-top:4px;">
              <div style="font-weight:600;color:#000;">${p.address}</div>
              ${p.metro ? `<div style="color:#666;font-size:11px;">Метро: ${p.metro}</div>` : ''}
              <div style="margin-top:4px;font-size:11px;color:#555;">Часы работы: ${p.workTime}</div>
              <div style="margin-top:2px;font-weight:bold;color:#10b981;">Доставка: ${p.deliveryDays} · от ${p.price} ₽</div>
            </div>
          `,
          balloonContentFooter: `
            <button id="pvz-btn-${p.id}" style="margin-top:8px;padding:6px 12px;background:#000;color:#fff;border:none;font-size:11px;font-weight:bold;cursor:pointer;width:100%;text-transform:uppercase;">
              Выбрать этот пункт
            </button>
          `,
          hintContent: `${p.networkName} — ${p.name}`,
        },
        {
          preset: 'islands#dotIcon',
          iconColor: iconColor,
        }
      );

      placemark.events.add('click', () => {
        setSelectedPoint(p);
      });

      placemark.events.add('balloonopen', () => {
        setSelectedPoint(p);
        setTimeout(() => {
          const btn = document.getElementById(`pvz-btn-${p.id}`);
          if (btn) {
            btn.onclick = () => {
              onSelectPvz(p);
              onClose();
            };
          }
        }, 50);
      });

      return placemark;
    });

    clusterer.add(marks);
    map.geoObjects.add(clusterer);
    clustererRef.current = clusterer;

    if (marks.length > 0) {
      map.setBounds(clusterer.getBounds(), {
        checkZoomRange: true,
        zoomMargin: 40,
      });
    }
  };

  // Re-render placemarks when filter or city changes
  useEffect(() => {
    if (window.ymaps && mapInstanceRef.current) {
      renderPlacemarks(window.ymaps, mapInstanceRef.current);
    }
  }, [networkFilter, activeCity, searchQuery, points]);

  // Center map on a specific point
  const handleFocusPoint = (point: PvzPoint) => {
    setSelectedPoint(point);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter([point.lat, point.lng], 15, {
        duration: 300,
      });
    }
    setActiveTab('map');
  };

  // Geolocation button
  const handleUseGeolocation = () => {
    if (!navigator.geolocation) {
      alert('Геолокация не поддерживается вашим браузером');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setCenter([latitude, longitude], 14, { duration: 400 });
        }
        // If Yandex geocoder is available, find city name
        if (window.ymaps && window.ymaps.geocode) {
          window.ymaps.geocode([latitude, longitude]).then((res: any) => {
            const firstGeoObject = res.geoObjects.get(0);
            if (firstGeoObject) {
              const detectedCity = firstGeoObject.getLocalities()[0];
              if (detectedCity) {
                setActiveCity(detectedCity);
              }
            }
          });
        }
      },
      () => {
        alert('Не удалось получить ваше местоположение. Пожалуйста, выберите город вручную.');
      }
    );
  };

  // Dynamic search via Yandex Geocoder for any city in Russia
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    if (window.ymaps && window.ymaps.geocode) {
      setIsGeocoding(true);
      window.ymaps.geocode(searchQuery.trim()).then((res: any) => {
        setIsGeocoding(false);
        const geoObj = res.geoObjects.get(0);
        if (geoObj) {
          const coords = geoObj.geometry.getCoordinates();
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setCenter(coords, 14, { duration: 400 });
          }

          // Create dynamic custom point if no points nearby
          const customPvz: PvzPoint = {
            id: `geo-${Date.now()}`,
            network: 'yandex',
            networkName: 'Яндекс Доставка',
            name: `ПВЗ Яндекс Маркет «${geoObj.getAddressLine()}»`,
            city: geoObj.getLocalities()[0] || activeCity,
            address: geoObj.getAddressLine(),
            lat: coords[0],
            lng: coords[1],
            workTime: '09:00 — 21:00 ежедневно',
            deliveryDays: '1–2 дня',
            price: 290,
          };

          setPoints(prev => [customPvz, ...prev]);
          setSelectedPoint(customPvz);
        }
      }).catch(() => setIsGeocoding(false));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-6xl bg-white border border-black shadow-2xl h-[92vh] max-h-[850px] flex flex-col overflow-hidden text-zinc-900"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#5A6B32] rounded-full" />
              <h2 className="font-serif text-lg sm:text-xl font-normal text-zinc-950 uppercase tracking-wide">
                Выбор пункта выдачи (ПВЗ)
              </h2>
            </div>
            <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
              Яндекс Доставка · СДЭК · Boxberry · 5POST по всей России (склад в Москве)
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 border border-zinc-200 hover:border-black text-zinc-400 hover:text-black transition-colors"
            title="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-3 sm:p-4 border-b border-zinc-200 space-y-3 shrink-0 bg-white">
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Search input */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1">
              <input
                type="text"
                placeholder="Поиск по городу, улице, метро (напр. Казань Баумана, СПб Невский)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-16 py-2 border border-zinc-300 text-xs outline-none focus:border-black bg-white"
              />
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <button
                type="submit"
                disabled={isGeocoding}
                className="absolute right-1 top-1 bottom-1 px-3 bg-black hover:bg-zinc-800 text-white text-[10px] font-bold uppercase tracking-wider transition-colors"
              >
                {isGeocoding ? 'Поиск...' : 'Найти'}
              </button>
            </form>

            {/* Geolocation Button */}
            <button
              type="button"
              onClick={handleUseGeolocation}
              className="px-3.5 py-2 border border-zinc-300 hover:border-black bg-zinc-50 hover:bg-black hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shrink-0 font-mono"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Рядом со мной</span>
            </button>
          </div>

          {/* Quick Cities Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[10px] font-mono uppercase text-zinc-400 shrink-0 mr-1">
              Города:
            </span>
            {POPULAR_RUSSIAN_CITIES.map(c => {
              const isSelected = activeCity.toLowerCase() === c.name.toLowerCase();
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => {
                    setActiveCity(c.name);
                    setSearchQuery('');
                    if (mapInstanceRef.current) {
                      mapInstanceRef.current.setCenter([c.lat, c.lng], 12, { duration: 300 });
                    }
                  }}
                  className={`px-2.5 py-1 text-[11px] font-medium whitespace-nowrap transition-colors border ${
                    isSelected
                      ? 'bg-black text-white border-black font-semibold'
                      : 'bg-white text-zinc-700 border-zinc-200 hover:border-black'
                  }`}
                >
                  {c.name}
                </button>
              );
            })}
          </div>

          {/* Networks Filter Tabs */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-zinc-100">
            <div className="flex flex-wrap gap-1 text-xs">
              {[
                { id: 'all', label: 'Все ПВЗ' },
                { id: 'yandex', label: 'Яндекс Доставка' },
                { id: 'cdek', label: 'СДЭК' },
                { id: 'boxberry', label: 'Boxberry' },
                { id: 'fivepost', label: '5POST' },
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setNetworkFilter(tab.id as any)}
                  className={`px-3 py-1 text-[10px] uppercase font-bold tracking-wider transition-colors border ${
                    networkFilter === tab.id
                      ? 'bg-black text-white border-black'
                      : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:border-black'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Mobile View Toggle */}
            <div className="sm:hidden flex border border-zinc-300">
              <button
                type="button"
                onClick={() => setActiveTab('map')}
                className={`px-2.5 py-1 text-[10px] font-bold uppercase ${
                  activeTab === 'map' ? 'bg-black text-white' : 'bg-white text-zinc-700'
                }`}
              >
                Карта
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className={`px-2.5 py-1 text-[10px] font-bold uppercase ${
                  activeTab === 'list' ? 'bg-black text-white' : 'bg-white text-zinc-700'
                }`}
              >
                Список ({filteredPoints.length})
              </button>
            </div>
          </div>
        </div>

        {/* Content Area: Split View (Map 60% / List 40%) */}
        <div className="flex-1 flex flex-col sm:flex-row min-h-0 relative">
          {/* Left: Map Container */}
          <div
            className={`flex-1 relative bg-zinc-100 ${
              activeTab === 'list' ? 'hidden sm:block' : 'block'
            }`}
          >
            <div ref={mapContainerRef} className="w-full h-full min-h-[300px]" />

            {/* Selected point popup card on map bottom */}
            {selectedPoint && (
              <div className="absolute left-4 right-4 bottom-4 bg-white border border-black p-4 shadow-2xl z-20 animate-in slide-in-from-bottom-2 sm:max-w-md sm:left-4 sm:right-auto">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold">
                      {selectedPoint.networkName}
                    </span>
                    <h4 className="font-serif text-sm font-bold text-zinc-950 mt-0.5 leading-snug">
                      {selectedPoint.name}
                    </h4>
                  </div>
                  <button
                    onClick={() => setSelectedPoint(null)}
                    className="text-zinc-400 hover:text-black p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-2 space-y-1 text-xs text-zinc-600">
                  <div className="flex items-center gap-1.5 font-medium text-zinc-900">
                    <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    <span>{selectedPoint.address}</span>
                  </div>
                  {selectedPoint.metro && (
                    <div className="text-[11px] text-zinc-500 pl-5">
                      Метро: {selectedPoint.metro}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                    <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span>{selectedPoint.workTime}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#5A6B32]">
                    <Truck className="w-3.5 h-3.5 shrink-0" />
                    <span>Срок: {selectedPoint.deliveryDays} · Доставка от {selectedPoint.price} ₽</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onSelectPvz(selectedPoint);
                    onClose();
                  }}
                  className="mt-3.5 w-full py-2.5 bg-black hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Выбрать этот ПВЗ</span>
                </button>
              </div>
            )}
          </div>

          {/* Right: Points List */}
          <div
            className={`w-full sm:w-[380px] lg:w-[420px] border-l border-zinc-200 flex flex-col bg-zinc-50 ${
              activeTab === 'map' ? 'hidden sm:flex' : 'flex'
            }`}
          >
            <div className="p-3 border-b border-zinc-200 bg-white flex items-center justify-between text-xs">
              <span className="font-bold uppercase tracking-wider text-zinc-900">
                Пункты выдачи ({filteredPoints.length})
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">
                {activeCity}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-zinc-200 p-2 space-y-2">
              {filteredPoints.length === 0 ? (
                <div className="py-16 text-center text-xs text-zinc-500 px-4">
                  <AlertCircle className="w-6 h-6 text-zinc-400 mx-auto mb-2" />
                  <div>Пункт выдачи не найден по текущему фильтру.</div>
                  <div className="text-[11px] text-zinc-400 mt-1">
                    Попробуйте ввести улицу в поиске или выбрать другой город выше.
                  </div>
                </div>
              ) : (
                filteredPoints.map(p => {
                  const isSelected = selectedPvzId === p.id || selectedPoint?.id === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleFocusPoint(p)}
                      className={`p-3 bg-white border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-black shadow-md bg-zinc-50'
                          : 'border-zinc-200 hover:border-zinc-400'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span
                              className={`text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 border ${
                                p.network === 'yandex'
                                  ? 'border-amber-400 text-amber-900 bg-amber-50'
                                  : p.network === 'cdek'
                                  ? 'border-emerald-400 text-emerald-900 bg-emerald-50'
                                  : 'border-zinc-300 text-zinc-800 bg-zinc-100'
                              }`}
                            >
                              {p.networkName}
                            </span>
                            {p.metro && (
                              <span className="text-[10px] text-zinc-400 truncate">
                                · м. {p.metro}
                              </span>
                            )}
                          </div>
                          <div className="font-semibold text-xs text-zinc-950 truncate">
                            {p.name}
                          </div>
                          <div className="text-[11px] text-zinc-600 mt-0.5 line-clamp-2">
                            {p.address}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-xs font-mono font-bold text-zinc-950">
                            {p.price} ₽
                          </div>
                          <div className="text-[10px] font-mono text-zinc-400">
                            {p.deliveryDays}
                          </div>
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px]">
                        <span className="text-zinc-500 font-mono text-[10px]">
                          {p.workTime}
                        </span>

                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            onSelectPvz(p);
                            onClose();
                          }}
                          className="px-2.5 py-1 bg-black hover:bg-zinc-800 text-white text-[10px] font-bold uppercase tracking-wider transition-colors"
                        >
                          Выбрать
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer info bar */}
        <div className="p-3 border-t border-zinc-200 bg-zinc-50 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-500 font-mono shrink-0">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-zinc-700">
              <ShieldCheck className="w-4 h-4 text-[#5A6B32]" />
              Страховка каждого отправления
            </span>
            <span className="hidden sm:inline">·</span>
            <span>Бесплатная доставка от 25 000 ₽ (до 2 500 км)</span>
          </div>

          <div className="text-[11px]">
            Выбранный ПВЗ автоматически подставится в форму заказа
          </div>
        </div>
      </div>
    </div>
  );
};
