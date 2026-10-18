import React, { useState, useEffect } from 'react';
import {
  Server,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Shield,
  Activity,
  Zap,
  Globe,
  Database,
  X,
  Code
} from 'lucide-react';
import { apiClient, API_BASE_URL } from '../../services/api/client';
import { tagsApi } from '../../services/api/tagsApi';
import { roomsApi } from '../../services/api/roomsApi';

interface BackendStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ApiTestResult {
  endpoint: string;
  method: string;
  status: number | null;
  statusText?: string;
  latencyMs: number | null;
  data?: any;
  error?: string;
  loading: boolean;
}

export const BackendStatusModal: React.FC<BackendStatusModalProps> = ({ isOpen, onClose }) => {
  const [healthStatus, setHealthStatus] = useState<{ status: string; time: string; latencyMs: number } | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [selectedResult, setSelectedResult] = useState<ApiTestResult | null>(null);
  const [activeTab, setActiveTab] = useState<'endpoints' | 'response'>('endpoints');

  const [tests, setTests] = useState<{ [key: string]: ApiTestResult }>({
    health: { endpoint: '/health', method: 'GET', status: null, latencyMs: null, loading: false },
    countries: { endpoint: '/api/verification/countries', method: 'GET', status: null, latencyMs: null, loading: false },
    emailDomains: { endpoint: '/api/education/organizations', method: 'GET', status: null, latencyMs: null, loading: false },
    occupations: { endpoint: '/api/profile/occupations', method: 'GET', status: null, latencyMs: null, loading: false },
    tags: { endpoint: '/api/tags', method: 'GET', status: null, latencyMs: null, loading: false },
    rooms: { endpoint: '/api/rooms', method: 'GET', status: null, latencyMs: null, loading: false },
    me: { endpoint: '/api/auth/me', method: 'GET', status: null, latencyMs: null, loading: false },
  });

  const checkOverallHealth = async () => {
    setIsCheckingHealth(true);
    try {
      const res = await apiClient.checkHealth();
      setHealthStatus(res);
    } catch {
      setHealthStatus(null);
    } finally {
      setIsCheckingHealth(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkOverallHealth();
    }
  }, [isOpen]);

  const runTest = async (testKey: string) => {
    setTests(prev => ({
      ...prev,
      [testKey]: { ...prev[testKey], loading: true, status: null, latencyMs: null, error: undefined }
    }));

    const startTime = performance.now();
    try {
      let response: any;
      if (testKey === 'health') {
        const h = await apiClient.checkHealth();
        const latency = Math.round(performance.now() - startTime);
        const result: ApiTestResult = {
          endpoint: '/health',
          method: 'GET',
          status: h ? 200 : 503,
          latencyMs: latency,
          data: h,
          loading: false
        };
        setTests(prev => ({ ...prev, [testKey]: result }));
        setSelectedResult(result);
        return;
      } else if (testKey === 'countries') {
        response = await apiClient.get('/api/verification/countries');
      } else if (testKey === 'emailDomains') {
        response = await apiClient.get('/api/education/organizations');
      } else if (testKey === 'occupations') {
        response = await tagsApi.getOccupations();
      } else if (testKey === 'tags') {
        response = await tagsApi.getTags();
      } else if (testKey === 'rooms') {
        response = await roomsApi.getRooms();
      } else if (testKey === 'me') {
        response = await apiClient.get('/api/auth/me');
      }

      const latency = Math.round(performance.now() - startTime);
      const result: ApiTestResult = {
        endpoint: tests[testKey].endpoint,
        method: tests[testKey].method,
        status: response?.error?.status || (response?.ok ? 200 : 400),
        latencyMs: latency,
        data: response?.data,
        error: response?.error?.detail || response?.error?.title,
        loading: false
      };
      setTests(prev => ({ ...prev, [testKey]: result }));
      setSelectedResult(result);
    } catch (err: any) {
      const latency = Math.round(performance.now() - startTime);
      const result: ApiTestResult = {
        endpoint: tests[testKey].endpoint,
        method: tests[testKey].method,
        status: 500,
        latencyMs: latency,
        error: err?.message || 'Lỗi mạng không xác định',
        loading: false
      };
      setTests(prev => ({ ...prev, [testKey]: result }));
      setSelectedResult(result);
    }
  };

  const runAllTests = async () => {
    const keys = Object.keys(tests);
    for (const key of keys) {
      await runTest(key);
    }
  };

  if (!isOpen) return null;

  const token = apiClient.getAccessToken();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-800 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base tracking-tight text-white">Cổng Kết Nối AWS Backend (Swagger)</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Live ALB
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono mt-0.5 flex items-center gap-1.5">
                <Globe className="w-3 h-3 text-slate-400" />
                {API_BASE_URL}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`${API_BASE_URL}/swagger/index.html`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Swagger Docs</span>
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Health status banner */}
        <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200/70 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <span className={`w-2.5 h-2.5 rounded-full ${healthStatus ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              <span>Trạng thái máy chủ:</span>
              <span className={healthStatus ? 'text-emerald-700 font-black' : 'text-rose-600 font-black'}>
                {healthStatus ? `ONLINE (${healthStatus.latencyMs}ms)` : 'OFFLINE / DISCONNECTED'}
              </span>
            </div>
            {healthStatus?.time && (
              <span className="text-slate-400 text-[11px] font-mono hidden sm:inline">
                Time: {new Date(healthStatus.time).toLocaleTimeString()}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={checkOverallHealth}
              disabled={isCheckingHealth}
              className="px-3 py-1 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs"
            >
              <RefreshCw className={`w-3 h-3 ${isCheckingHealth ? 'animate-spin text-brand-600' : ''}`} />
              <span>Ping lại</span>
            </button>
            <button
              onClick={runAllTests}
              className="px-3 py-1 rounded-lg bg-slate-900 text-white font-semibold text-xs flex items-center gap-1.5 hover:bg-slate-800 transition-all shadow-xs"
            >
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Kiểm tra toàn bộ API</span>
            </button>
          </div>
        </div>

        {/* Content Tabs & Panels */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left Column: API List (7 cols) */}
          <div className="lg:col-span-7 border-r border-slate-200 overflow-y-auto p-4 space-y-2.5 bg-white">
            <div className="flex items-center justify-between pb-2 mb-1 border-b border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Danh sách API WebApp Tích Hợp
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Bearer Token: {token ? <span className="text-emerald-600 font-bold">Đã nạp</span> : <span className="text-amber-600 font-bold">Chưa có (Dùng Public)</span>}
              </span>
            </div>

            {Object.entries(tests).map(([key, t]) => {
              const isSelected = selectedResult?.endpoint === t.endpoint;
              return (
                <div
                  key={key}
                  onClick={() => {
                    if (t.status !== null) {
                      setSelectedResult(t);
                    }
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-brand-500 bg-brand-50/20 shadow-sm'
                      : 'border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase font-mono bg-slate-100 text-slate-700 border border-slate-200">
                        {t.method}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-900 truncate">
                        {t.endpoint}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500">
                      {key === 'health' && <span>Kiểm tra tính hoạt động hệ thống</span>}
                      {key === 'countries' && <span>Danh sách quốc gia & mã vùng (+84)</span>}
                      {key === 'emailDomains' && <span>Tên miền email sinh viên / giáo dục</span>}
                      {key === 'occupations' && <span>Danh mục nghề nghiệp hồ sơ</span>}
                      {key === 'tags' && <span>Sở thích ăn uống & tính cách</span>}
                      {key === 'rooms' && <span>Danh sách bàn ghép (Rooms)</span>}
                      {key === 'me' && <span>Thông tin tài khoản đang đăng nhập</span>}
                    </div>
                  </div>

                  {/* Status & Action */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {t.loading ? (
                      <span className="text-xs text-brand-600 font-bold flex items-center gap-1">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Đang gọi...
                      </span>
                    ) : t.status !== null ? (
                      <div className="text-right">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-lg text-[10px] font-black font-mono ${
                            t.status >= 200 && t.status < 300
                              ? 'bg-emerald-100 text-emerald-800'
                              : t.status === 401
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          HTTP {t.status}
                        </span>
                        {t.latencyMs !== null && (
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {t.latencyMs}ms
                          </div>
                        )}
                      </div>
                    ) : null}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        runTest(key);
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                      title="Gọi API này ngay"
                    >
                      Gọi API
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Response Viewer (5 cols) */}
          <div className="lg:col-span-5 bg-slate-900 text-slate-200 p-4 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Dữ Liệu Trả Về (JSON Response)
                </span>
              </div>
              {selectedResult && (
                <span className="text-[10px] font-mono text-slate-400">
                  {selectedResult.latencyMs}ms
                </span>
              )}
            </div>

            {selectedResult ? (
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between text-xs font-mono bg-slate-950/60 p-2.5 rounded-xl mb-2 border border-slate-800">
                  <span className="text-amber-400 font-bold">{selectedResult.method} {selectedResult.endpoint}</span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    selectedResult.status && selectedResult.status < 300 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    Status: {selectedResult.status}
                  </span>
                </div>

                <div className="flex-1 overflow-auto bg-slate-950 p-3 rounded-2xl border border-slate-800 font-mono text-xs text-slate-300">
                  {selectedResult.error ? (
                    <div className="text-rose-400">
                      <div className="font-bold mb-1">Error Response:</div>
                      <div>{selectedResult.error}</div>
                    </div>
                  ) : selectedResult.data !== undefined ? (
                    <pre className="whitespace-pre-wrap word-break">
                      {JSON.stringify(selectedResult.data, null, 2)}
                    </pre>
                  ) : (
                    <div className="text-slate-500 italic">Không có dữ liệu payload</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <Database className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-xs">Chọn hoặc bấm &ldquo;Gọi API&rdquo; ở cột bên trái để xem dữ liệu JSON phản hồi trực tiếp từ AWS ALB</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Hệ thống tự động kích hoạt cơ chế Offline/Mock Fallback khi AWS Backend bận.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
