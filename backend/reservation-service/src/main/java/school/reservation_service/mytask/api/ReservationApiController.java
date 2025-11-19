package school.reservation_service.mytask.api;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import school.reservation_service.mytask.service.ReservationCommandService;

record ReserveReq(@NotNull Long slotId) {}
record ReserveRes(Long reservationId) {}

@RestController
@RequestMapping("/api")
public class  ReservationApiController {
    private final ReservationCommandService reservationSvc;

    public ReservationApiController(ReservationCommandService reservationSvc) {
        this.reservationSvc = reservationSvc;
    }

    @PostMapping("/reservations")
    public ResponseEntity<ReserveRes> reserve(@RequestBody  ReserveReq req, HttpSession session) {
        Object uid = session.getAttribute("LOGIN_USER_ID");
        if (uid == null) return ResponseEntity.status(401).build();
        Long userId;
        try {
            userId = Long.valueOf(uid.toString());
            System.out.println(userId);
        } catch (NumberFormatException e) {
            return ResponseEntity.status(400).build();
        }

        Long rid = reservationSvc.reserve(userId, req.slotId());
        return ResponseEntity.ok(new ReserveRes(rid));
    }
    @DeleteMapping("/reservations/{reservationId}")
        public ResponseEntity<Void> delete(@PathVariable Long reservationId, HttpSession session) {
        Object uid = session.getAttribute("LOGIN_USER_ID");
        if (uid == null) return ResponseEntity.status(401).build();
        Long userId;
        try {
            userId = Long.valueOf(uid.toString());
        }catch (NumberFormatException e) {
            return ResponseEntity.status(400).build();
        }
        try{
            reservationSvc.cancelReservation(userId, reservationId);
            // 삭제 성공 시 204 No Content 반환
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            // 예약을 찾을 수 없거나 권한이 없는 경우
            return ResponseEntity.status(404).build();
        } catch (Exception e) {
            // 기타 오류
            return ResponseEntity.status(500).build();
        }

    }
}
