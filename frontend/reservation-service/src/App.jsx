import React, { useState, useEffect } from 'react';

/**
 * ----------------------------------------------------------------
 * React Router DOM 설치가 필요합니다.
 * 터미널에서 `npm install react-router-dom` 명령어를 실행해주세요.
 * ----------------------------------------------------------------
 */
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
  useParams // 👈 동적 파라미터를 읽기 위해 useParams 추가
} from 'react-router-dom';

// ----------------------------------------------------------------
// 1. 페이지 컴포넌트 정의
// ----------------------------------------------------------------

/**
 * 메인 화면 (경로: /)
 * (변경 없음)
 */
function MainPage() {
  return (
    <div style={styles.container}>
      <h1 style={styles.header}>체육시설 예약 시스템</h1>
      <p style={styles.text}>방문을 환영합니다. 로그인이 필요합니다.</p>
      <Link to="/login" style={styles.button}>
        접속하기
      </Link>
    </div>
  );
}

/**
 * 로그인 화면 (경로: /login)
 * (변경 없음)
 */
function LoginPage() {
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('error')) {
      setError('로그인 정보가 올바르지 않습니다.');
    }
  }, [location]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          name: name,
          studentId: studentId,
        }),
        credentials: 'include', 
      });

      if (response.ok) {
        navigate('/schedule');
      } 
      else if (response.redirected && response.url.includes('error=1')) {
         setError('학번이 너무 짧거나 유효하지 않습니다.');
      }
      else if (response.status === 401) {
          setError('로그인 정보가 올바르지 않습니다.');
      }
      else {
        setError('로그인에 실패했습니다. 서버 오류.');
      }
    } catch (err) {
      setError('네트워크 오류가 발생했습니다. (CORS 또는 서버 다운)');
      console.error(err);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>로그인</h1>
      <form onSubmit={handleLogin} style={styles.form}>
        <div style={styles.inputGroup}>
          <label htmlFor="name" style={styles.label}>이름</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={styles.input}
          />
        </div>
        <div style={styles.inputGroup}>
          <label htmlFor="studentId" style={styles.label}>학번</label>
          <input
            type="text"
            id="studentId"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            required
            style={styles.input}
          />
        </div>
        {error && <p style={styles.error}>{error}</p>}
        <button type="submit" style={styles.button}>
          로그인
        </button>

      </form>
      <Link to="/" style={styles.backLink}>메인으로</Link>
    </div>
  );
}

/**
 * facility.name을 기반으로 오늘 날짜의 YYYY-MM-DD 문자열을 반환하는 헬퍼 함수
 */
function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

/**
 * ----------------------------------------------------------------
 * [신규] 시설별 상세 예약 페이지 (경로: /schedule/:facilityName)
 * ----------------------------------------------------------------
 */
function FacilitySchedulePage() {
  const { facilityName } = useParams(); // URL에서 시설 이름 파라미터 가져오기
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [timeSlots, setTimeSlots] = useState([]); // 예약 슬롯 목록
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 날짜가 변경되거나 컴포넌트가 처음 로드될 때 슬롯 정보를 불러옵니다.
  useEffect(() => {
    loadRealTimeSlots();
  }, [selectedDate]); // selectedDate가 변경될 때마다 이 effect가 다시 실행됩니다.

  /**
   * (schedule.js의 loadRealTimeSlots 로직)
   * 서버에서 실제 예약 슬롯 데이터를 가져와 시간표와 병합합니다.
   */
  const loadRealTimeSlots = async () => {
    setLoading(true);

    const today = getTodayString();
    const now = new Date();

    try {
      // 1. 실제 슬롯 데이터 가져오기
      // GET /api/schedule/slots?facility=TENNIS&date=2025-10-30
      const slotsResponse = await fetch(
        `/api/schedule/slots?facility=${encodeURIComponent(facilityName)}&date=${selectedDate}`, 
        { credentials: 'include' }
      );
     
  

      if (!slotsResponse.ok) {
        if (slotsResponse.status === 401) {
          alert('세션이 만료되었습니다. 다시 로그인해주세요.');
          navigate('/login');
        }
        throw new Error('슬롯 데이터를 불러오지 못했습니다.');
      }

      const realSlots = await slotsResponse.json(); // DB에 존재하는 슬롯 목록
      console.log(realSlots);

      // 2. 6시부터 22시까지 1시간 단위의 프론트엔드용 시간표 생성
      const startHour = 6;
      const endHour = 22;
      const slots = [];
      const isPastDate = selectedDate < today;

      for (let hour = startHour; hour < endHour; hour++) {
        const startTime = `${hour.toString().padStart(2, '0')}:00`;
        const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;

        // 3. DB 데이터와 시간표 매칭
        const realSlot = realSlots.find(slot => {
            const slotStart = slot.startAt.substring(11, 16); // "HH:MM" 부분만 추출
            return slotStart === startTime;
        });
        
        let status = 'unavailable'; // 기본값: 이용 불가 (DB에 슬롯 레코드가 없음)
        let slotId = null;
        let capacity = 0;

        // 4. 상태 결정
        if (isPastDate) {
          status = 'unavailable'; // 과거 날짜
        } else if (selectedDate === today && now.getHours() >= hour) {
          status = 'unavailable'; // 오늘 날짜의 이미 지난 시간
        } else if (realSlot) {
          // DB에 슬롯이 존재함
          slotId = realSlot.id; //  서버 DTO의 'slotId' 필드 사용
          capacity = realSlot.capacity;
          status=(capacity ===1 ? 'reserved':'available');
          
          //서버에서 가져온 데이터 capacity가 0이라면 예약 가능 1이라면 이미 예약됨
         
          

        }

        slots.push({
            time: `${startTime} - ${endTime}`,
            status: status,
            hour: hour,
            slotId: slotId,
            capacity: capacity,
        });
      }
      
      setTimeSlots(slots); // 상태 업데이트 -> React가 화면을 다시 그림
      
    } catch (error) {
      console.error('실제 슬롯 로드 실패:', error);
      setTimeSlots([]); // 오류 발생 시 빈 목록으로 설정
    } finally {
      setLoading(false);
    }
  };

  /**
   * (schedule.js의 makeReservation 로직)
   * 예약 API 호출
   */
  const handleReservation = async (slotId, hour, status) => {
    // 1. 유효성 검사
    if (status !== 'available' || !slotId) {
        if (!slotId && status === 'available') {
            alert('예약 가능한 슬롯 ID를 찾을 수 없습니다. (데이터 오류)');
        }
        return; // 예약 불가 버튼이거나 ID가 없으면 중단
    }

    // 2. 예약 확인
    const confirmMessage = `${facilityName} / ${selectedDate} / ${hour.toString().padStart(2, '0')}:00 시간대를 예약하시겠습니까?`;
    if (!confirm(confirmMessage)) {
      return;
    }

    // 3. API 호출
    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          slotId: slotId // 👈 서버(ReserveReq)가 요구하는 slotId만 전송
        })
      });

      if (response.ok) {
        alert(`${facilityName} 예약이 완료되었습니다!`);
        loadRealTimeSlots(); // 예약 완료 후 시간표 새로고침
      } else {
        // GlobalExceptionHandler에서 보낸 JSON 오류 응답 처리
        const error = await response.json();
        alert(`${facilityName} 예약 실패: ${error.message || '알 수 없는 오류가 발생했습니다.'}`);
      }
    } catch (error) {
      console.error('예약 실패:', error);
      alert('예약 중 오류가 발생했습니다.');
    }
  };

  return (
    <div style={styles.container}>
      <Link to="/schedule" style={styles.backLink}>← 시설 목록으로</Link>
      <h1 style={styles.header}>{facilityName} 예약</h1>
      
      {/* 날짜 선택기 */}
      <div style={styles.inputGroup}>
        <label htmlFor="dateInput" style={styles.label}>예약 날짜:</label>
        <input 
          type="date" 
          id="dateInput" 
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={styles.input}
        />
      </div>

      {/* 시간 슬롯 그리드 */}
      {loading ? (
        <p>시간대를 불러오는 중...</p>
      ) : (
        <div style={styles.grid}>
          {timeSlots.map((slot) => (
            <div key={slot.hour} style={{...styles.card, ...styles.slotCard[slot.status]}}>
              <div style={styles.slotTime}>{slot.time}</div>
              <div style={styles.slotStatus[slot.status]}>
                {slot.status === 'available' ? '예약 가능' :
                 slot.status === 'reserved' ? '예약됨' : '이용 불가'}
              </div>
              <button 
                style={{...styles.button, ...styles.slotButton[slot.status]}}
                onClick={() => handleReservation(slot.slotId, slot.hour, slot.status)}
                disabled={slot.status !== 'available'}
              >
                {slot.status === 'available' ? '예약하기' :
                 slot.status === 'reserved' ? '예약됨' : '이용 불가'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


/**
 * ----------------------------------------------------------------
 * [수정] 시설 목록 페이지 (경로: /schedule)
 * ----------------------------------------------------------------
 */
function SchedulePage() {
  const [facilities, setFacilities] = useState([]);
  const [myReservations, setMyReservations] = useState([]);
  const [showReservations, setShowReservations] = useState(false);
  const [selectedReservations, setSelectedReservations] = useState(new Set()); // 선택된 예약 ID들
  const [isDeleting, setIsDeleting] = useState(false); // 삭제 중 상태
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const response = await fetch('/api/facilities', {
          credentials: 'include', 
        });

        if (!response.ok) {
          if (response.status === 401) {
            alert('로그인이 필요합니다.');
            navigate('/login');
            return;
          }
          throw new Error('시설 목록 로드 실패');
        }
        
        const data = await response.json();
        setFacilities(data);
      } catch (err) {
        console.error(err);
        alert('서버와 통신에 실패했습니다. Spring 서버 및 CORS 설정을 확인하세요.');
      }
    };
    
    fetchFacilities();
  }, [navigate]);


  const handleLogout = async () => {
    await fetch('/api/auth/logout', {
      method: 'GET',
      credentials: 'include'
    });
    navigate('/login');
  };

  const handleShowReservedFacilities = async () => {
    try {
      const response = await fetch('/api/myReservation', {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          alert('로그인이 필요합니다.');
          navigate('/login');
          return;
        }
        throw new Error('예약 내역을 불러오지 못했습니다.');
      }

      const data = await response.json();
      setMyReservations(data);
      setSelectedReservations(new Set()); // 목록을 새로 불러올 때 선택 초기화
      setShowReservations(true);
    } catch (err) {
      console.error(err);
      alert('예약 내역을 불러오는 중 오류가 발생했습니다.');
    }
  };

  // 체크박스 선택/해제 핸들러
  const handleCheckboxChange = (reservationId) => {
    const newSelected = new Set(selectedReservations);
    if (newSelected.has(reservationId)) {
      newSelected.delete(reservationId);
    } else {
      newSelected.add(reservationId);
    }
    setSelectedReservations(newSelected);
  };

  // 전체 선택/해제 핸들러
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = new Set(myReservations.map(r => r.reservationId));
      setSelectedReservations(allIds);
    } else {
      setSelectedReservations(new Set());
    }
  };

  // 선택된 예약들 삭제
  const handleDeleteSelected = async () => {
    if (selectedReservations.size === 0) {
      alert('삭제할 예약을 선택해주세요.');
      return;
    }

    const confirmMessage = `선택한 ${selectedReservations.size}개의 예약을 삭제하시겠습니까?`;
    if (!confirm(confirmMessage)) {
      return;
    }

    setIsDeleting(true);

    try {
      // 선택된 모든 예약을 순차적으로 삭제
      const deletePromises = Array.from(selectedReservations).map(async (reservationId) => {
        const response = await fetch(`/api/reservations/${reservationId}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('로그인이 필요합니다.');
          } else if (response.status === 404) {
            throw new Error(`예약 ID ${reservationId}를 찾을 수 없습니다.`);
          } else {
            throw new Error(`예약 ID ${reservationId} 삭제 실패`);
          }
        }
        return reservationId;
      });

      // 모든 삭제 요청이 완료될 때까지 대기
      await Promise.all(deletePromises);

      alert(`${selectedReservations.size}개의 예약이 삭제되었습니다.`);

      // 목록 새로고침
      await handleShowReservedFacilities();

    } catch (err) {
      console.error('삭제 실패:', err);
      alert(`삭제 중 오류가 발생했습니다: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
      <div style={styles.container}>
        <div style={styles.scheduleHeader}>
          <h1 style={styles.header}>시설 목록</h1>
          <button onClick={handleLogout} style={styles.logoutButton}>로그아웃</button>
        </div>

        {showReservations ? (
            <div>
              <div style={styles.reservationHeader}>
                <h2>내 예약 내역</h2>
                <button onClick={() => {
                  setShowReservations(false);
                  setSelectedReservations(new Set());
                }} style={styles.backButton}>
                  목록으로 돌아가기
                </button>
              </div>

              {myReservations.length === 0 ? (
                  <p>예약 내역이 없습니다.</p>
              ) : (
                  <>
                    {/* 전체 선택 및 삭제 버튼 */}
                    <div style={styles.reservationActions}>
                      <label style={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            checked={selectedReservations.size === myReservations.length && myReservations.length > 0}
                            onChange={handleSelectAll}
                            style={styles.checkbox}
                        />
                        전체 선택
                      </label>
                      <button
                          onClick={handleDeleteSelected}
                          disabled={selectedReservations.size === 0 || isDeleting}
                          style={{
                            ...styles.deleteButton,
                            opacity: selectedReservations.size === 0 || isDeleting ? 0.5 : 1,
                            cursor: selectedReservations.size === 0 || isDeleting ? 'not-allowed' : 'pointer'
                          }}
                      >
                        {isDeleting ? '삭제 중...' : `선택한 ${selectedReservations.size}개 삭제`}
                      </button>
                    </div>



                    {/* 예약 목록 */}
                    <div style={styles.grid}>
                      {myReservations.map((reservation) => (
                          <div
                              key={reservation.reservationId}
                              style={{
                                ...styles.card,
                                ...(selectedReservations.has(reservation.reservationId) ? styles.selectedCard : {})
                              }}
                          >
                            {/* 체크박스를 카드 상단 우측에 배치 */}
                            <label style={styles.cardCheckboxLabel}>
                              <input
                                  type="checkbox"
                                  checked={selectedReservations.has(reservation.reservationId)}
                                  onChange={() => handleCheckboxChange(reservation.reservationId)}
                                  style={styles.checkbox}
                              />
                            </label>

                            {/* 카드 내용 */}
                            <div style={{ paddingTop: '5px' }}>
                              <h3 style={{ marginTop: '0', marginBottom: '10px' }}>{reservation.facility}</h3>
                              <p style={{ margin: '5px 0', fontSize: '14px' }}>
                                <strong>예약 상태:</strong> {reservation.status === 'BOOKED' ? '예약됨' : '취소됨'}
                              </p>
                              <p style={{ margin: '5px 0', fontSize: '14px' }}>
                                <strong>시작 시간:</strong><br />
                                {new Date(reservation.startAt).toLocaleString('ko-KR')}
                              </p>
                              <p style={{ margin: '5px 0', fontSize: '14px' }}>
                                <strong>종료 시간:</strong><br />
                                {new Date(reservation.endAt).toLocaleString('ko-KR')}
                              </p>
                              <p style={{ margin: '5px 0', fontSize: '14px' }}>
                                <strong>예약 일시:</strong><br />
                                {new Date(reservation.createdAt).toLocaleString('ko-KR')}
                              </p>
                            </div>
                          </div>
                      ))}
                    </div>                </>
              )}
            </div>
        ) : (
            <>
              <p>예약할 시설을 선택하세요:</p>
              <div style={styles.grid}>
                {facilities.length > 0 ? (
                    facilities.map((f) => (
                        <div key={f.name} style={styles.card}>
                          <h3>{f.name}</h3>
                          <Link
                              to={`/schedule/${encodeURIComponent(f.name)}`}
                              style={{...styles.button, textDecoration: 'none', marginTop: '30px'}}
                          >
                            예약하기
                          </Link>
                        </div>
                    ))
                ) : (
                    <p>시설 정보를 불러오는 중...</p>
                )}
              </div>
              <button onClick={handleShowReservedFacilities} style={styles.ShowReservedButton}>
                예약내역 확인
              </button>
            </>
        )}
      </div>
  );
}


// ----------------------------------------------------------------
// 2. 라우터 설정 및 메인 앱
// ----------------------------------------------------------------

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<LoginPage />} />
        {/* [수정] 시설 목록 페이지와 상세 페이지 라우트 분리 */}
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/schedule/:facilityName" element={<FacilitySchedulePage />} />
      </Routes>
    </BrowserRouter>
  );
}

// ----------------------------------------------------------------
// 3. 간단한 인라인 스타일
// (스타일 객체가 너무 커서 생략... 이전 코드의 styles 객체를 그대로 사용)
// ----------------------------------------------------------------
const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    maxWidth: '800px',
    margin: '40px auto',
    padding: '20px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  },
  header: {
    fontSize: '28px',
    color: '#333',
    marginBottom: '20px',
  },
  text: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '30px',
  },
  button: {
    display: 'inline-block',
    padding: '10px 20px',
    fontSize: '16px',
    color: 'white',
    backgroundColor: '#3498db',
    border: 'none',
    borderRadius: '5px',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    width: '100%',
    boxSizing: 'border-box',
  },
  form: {
    textAlign: 'left',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold',
  },
  inputGroup: {
    marginBottom: '15px',
  },
  input: {
    width: '100%',
    padding: '8px',
    fontSize: '16px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxSizing: 'border-box',
  },
  error: {
    color: 'red',
    fontSize: '14px',
    marginBottom: '10px',
    textAlign: 'center',
  },
  backLink: {
    display: 'block',
    marginTop: '20px',
    marginBottom: '10px',
    fontSize: '14px',
    color: '#777',
    textAlign: 'left'
  },
  scheduleHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  logoutButton: {
    padding: '8px 12px',
    fontSize: '14px',
    color: 'white',
    backgroundColor: '#e74c3c',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  ShowReservedButton: {
    padding: '8px 12px',
    fontSize: '14px',
    color: 'white',
    backgroundColor: '#28a745',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '5px',
    marginTop: '15px',
    marginLeft: '699px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '16px',
    marginTop: '20px'
  },
  card: {
    position: 'relative', // 추가: 체크박스 위치 지정을 위해
    border: '1px solid #eee',
    borderRadius: '8px',
    padding: '16px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    textAlign: 'center',
    minHeight: '200px', // 추가: 카드 최소 높이
  },
  reservationHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  backButton: {
    padding: '8px 16px',
    fontSize: '14px',
    color: 'white',
    backgroundColor: '#6c757d',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  slotTime: {
    fontWeight: 700,
    fontSize: '16px',
    color: '#333',
    marginBottom: '8px',
  },
  slotCard: {
    available: { background: '#fff', borderColor: '#e8f5e8' },
    reserved: { background: '#f8f8f8', borderColor: '#e0e0e0', opacity: 0.6 },
    unavailable: { background: '#f5f5f5', borderColor: '#ddd', opacity: 0.5 },
  },
  slotStatus: {
    available: { color: '#155724', background: '#d4edda', padding: '4px 8px', borderRadius: '6px', fontSize: '14px', marginBottom: '12px' },
    reserved: { color: '#721c24', background: '#f8d7da', padding: '4px 8px', borderRadius: '6px', fontSize: '14px', marginBottom: '12px' },
    unavailable: { color: '#6c757d', background: '#e2e3e5', padding: '4px 8px', borderRadius: '6px', fontSize: '14px', marginBottom: '12px' },
  },
  slotButton: {
    available: { backgroundColor: '#3498db', color: 'white' },
    reserved: { backgroundColor: '#95a5a6', color: 'white', cursor: 'not-allowed' },
    unavailable: { backgroundColor: '#bdc3c7', color: 'white', cursor: 'not-allowed' },
  },
  reservationActions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    padding: '10px',
    backgroundColor: '#f8f9fa',
    borderRadius: '5px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  cardCheckboxLabel: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    cursor: 'pointer',
    zIndex: 10, // 추가: 다른 요소 위에 표시
  },
  checkbox: {
    width: '18px',
    height: '18px',
    marginRight: '8px',
    cursor: 'pointer',
  },
  deleteButton: {
    padding: '10px 20px',
    fontSize: '14px',
    color: 'white',
    backgroundColor: '#dc3545',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  selectedCard: {
    border: '2px solid #007bff !important', // !important로 기본 border 덮어쓰기
    backgroundColor: '#f0f8ff',
  },
};


