from rest_framework.throttling import AnonRateThrottle


class ProgressPollThrottle(AnonRateThrottle):
    """
    High-rate throttle for the progress-polling endpoint.
    Allows ~1 request/second for up to an hour without hitting limits.
    """
    scope = 'progress_poll'