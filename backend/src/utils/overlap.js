/**
 * Two half-open intervals [aStart, aEnd) and [bStart, bEnd) overlap iff:
 *   aStart < bEnd  AND  aEnd > bStart
 *
 * Strict inequalities mean back-to-back appointments (one ending exactly
 * when the next starts) are NOT treated as a conflict.
 */
function intervalsOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && aEnd > bStart;
}

/**
 * existingAppointments: [{ _id, startTime: Date, durationMinutes: Number }]
 * Returns the first conflicting appointment, or undefined if the slot is free.
 */
function findConflict(newStart, newDurationMinutes, existingAppointments, excludeId) {
  const newStartMs = new Date(newStart).getTime();
  const newEndMs = newStartMs + newDurationMinutes * 60000;

  return existingAppointments.find((appt) => {
    if (excludeId && String(appt._id) === String(excludeId)) return false;

    const existStartMs = new Date(appt.startTime).getTime();
    const existEndMs = existStartMs + appt.durationMinutes * 60000;

    return intervalsOverlap(existStartMs, existEndMs, newStartMs, newEndMs);
  });
}

module.exports = { intervalsOverlap, findConflict };