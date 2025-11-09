package school.reservation_service.api;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import school.reservation_service.api.dto.MyReservationResponse;
import school.reservation_service.domain.Reservation;
import school.reservation_service.domain.ReservationSlot;
import school.reservation_service.repo.ReservationRepository;

import jakarta.servlet.http.HttpSession;
import java.util.List;
import java.util.stream.Collectors;

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

        List<MyReservationResponse> response = reservationRepository.findMyReservationsWithSlot(userId);


        return ResponseEntity.ok(response);
    }

    // DTO 레코드

}