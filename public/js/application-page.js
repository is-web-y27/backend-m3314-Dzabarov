(function () {
  const applicationForm = document.getElementById('application-form');
  const programSelect = document.getElementById('programId');
  const status = document.getElementById('application-status');
  const allowedPrograms = ['Горные походы', 'Борьба и ОФП', 'Медиашкола'];

  if (!applicationForm || !programSelect || !status) {
    return;
  }

  let allShifts = [];

  const setOptions = (select, items, labelBuilder) => {
    select.innerHTML = '';
    items.forEach((item) => {
      const option = document.createElement('option');
      option.value = item.id;
      option.textContent = labelBuilder(item);
      select.appendChild(option);
    });
  };

  const getJson = async (url) => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error();
    }
    return response.json();
  };

  const getOrCreateParticipant = async () => {
    const participantsData = await getJson('/api/participants?limit=50');
    const participants = Array.isArray(participantsData.items)
      ? participantsData.items
      : [];
    const email = applicationForm.email.value.trim();
    const existing = participants.find((item) => item.email === email);

    if (existing) {
      return existing;
    }

    const response = await fetch('/api/participants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: applicationForm.fullName.value.trim(),
        age: Number(applicationForm.age.value),
        email,
        phone: applicationForm.phone.value.trim(),
        city: applicationForm.city.value.trim() || null,
        telegram: applicationForm.telegram.value.trim() || null,
      }),
    });

    if (!response.ok) {
      throw new Error();
    }

    return response.json();
  };

  const loadPrograms = async () => {
    const data = await getJson('/api/programs');
    const items = Array.isArray(data.items)
      ? data.items.filter((item) => allowedPrograms.includes(item.title))
      : [];
    setOptions(programSelect, items, (item) => item.title);
  };

  const loadShifts = async () => {
    const data = await getJson('/api/shifts');
    allShifts = Array.isArray(data.items) ? data.items : [];
  };

  const resolveShiftId = () => {
    const shift = allShifts.find(
      (item) => Number(item.programId) === Number(programSelect.value),
    );
    return shift ? shift.id : null;
  };

  applicationForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    status.textContent = '';

    try {
      const participant = await getOrCreateParticipant();
      const shiftId = resolveShiftId();

      if (!shiftId) {
        throw new Error();
      }

      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId: participant.id,
          programId: Number(programSelect.value),
          shiftId,
          medicalApproved: applicationForm.medicalApproved.checked,
          parentConsent: applicationForm.parentConsent.checked,
          note: applicationForm.note.value.trim() || null,
        }),
      });

      if (!response.ok) {
        throw new Error();
      }

      status.textContent = 'Заявка успешно отправлена';
      if (window.toastr) {
        window.toastr.success('Заявка отправлена');
      }
      applicationForm.medicalApproved.checked = false;
      applicationForm.parentConsent.checked = false;
      applicationForm.note.value = '';
    } catch {
      status.textContent = 'Не удалось отправить заявку';
      if (window.toastr) {
        window.toastr.error('Не удалось отправить заявку');
      }
    }
  });

  Promise.all([loadPrograms(), loadShifts()]);
})();
