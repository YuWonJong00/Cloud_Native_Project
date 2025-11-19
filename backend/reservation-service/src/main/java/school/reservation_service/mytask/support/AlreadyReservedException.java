package school.reservation_service.mytask.support;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class AlreadyReservedException extends RuntimeException {
    public AlreadyReservedException(String message) {
        super(message);
        log.error(message);


    }
}
