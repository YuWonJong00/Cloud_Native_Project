package school.reservation_service.myuser.api;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import school.reservation_service.mytask.api.dto.MyReservationResponse;
import school.reservation_service.mytask.repo.ReservationRepository;

import jakarta.servlet.http.HttpSession;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/myReservation")
@RequiredArgsConstructor
public class UserReservationController {
    private final ReservationRepository reservationRepository;

    @GetMapping
    public ResponseEntity<?> showReservedFacilities(HttpSession session) {
        // 세션에서 userId 가져오기
        Object uid = session.getAttribute("LOGIN_USER_ID");
        if (uid == null) {
            return ResponseEntity.status(401).build();
        }

        Long userId;
        try {
            userId = Long.valueOf(uid.toString());
        } catch (NumberFormatException e) {
            return ResponseEntity.status(400).build();
        }

        List<Object[]> rows = reservationRepository.findMyReservationsWithSlot(userId);

        List<MyReservationResponse> response = rows.stream()
                .map(cols -> new MyReservationResponse(
                        (Long) cols[0],                      // reservationId
                        String.valueOf(cols[1]),             // status (ENUM → 문자열)
                        (java.time.LocalDateTime) cols[2],   // createdAt
                        (Long) cols[3],                      // slotId
                        (String) cols[4],                    // facility
                        (java.time.LocalDateTime) cols[5],   // startAt
                        (java.time.LocalDateTime) cols[6]    // endAt
                ))
                .toList();


        return ResponseEntity.ok(response);
    }

    // DTO 레코드

}