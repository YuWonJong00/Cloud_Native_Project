package school.reservation_service.api.dto;

public record MyReservationResponse(  Long reservationId,
                                      String status,
                                      java.time.LocalDateTime createdAt,
                                      Long slotId,
                                      String facility,
                                      java.time.LocalDateTime startAt,
                                      java.time.LocalDateTime endAt) {
}
