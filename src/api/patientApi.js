
import api from "./axiosClient";

// GET /api/monitoring/active-patients
// Role: monitor
export async function fetchPatients() {
  const { data } = await api.get("/monitoring/active-patients");

  const patients =
    data?.patients ??
    data?.data?.patients ??
    data?.data;

  if (!Array.isArray(patients)) {
    throw new Error(
      "Invalid patient-list response from backend."
    );
  }

  return patients.map(normalizePatient);
}

// GET /api/monitoring/patients/:patientId/latest
// Role: tablet owner or monitor
export async function fetchPatient(patientId) {
  if (!patientId) {
    throw new Error("Patient ID is required.");
  }

  const { data } = await api.get(
    `/monitoring/patients/${encodeURIComponent(patientId)}/latest`
  );

  const patient =
    data?.patient ??
    data?.data?.patient ??
    data?.data ??
    data;

  return normalizePatient(patient);
}

// GET /api/monitoring/patients/:patientId/history?page=1&limit=100
// Role: tablet owner or monitor

export async function fetchPatientHistory(
  patientId,
  page = 1,
  limit = 100
) {
  if (!patientId) {
    throw new Error("Patient ID is required.");
  }

  const { data } = await api.get(
    `/monitoring/patients/${encodeURIComponent(patientId)}/history`,
    {
      params: { page, limit },
    }
  );

  const readings =
    data?.readings ??
    data?.history ??
    data?.data?.readings ??
    data?.data?.history ??
    data?.data;

  if (!Array.isArray(readings)) {
    throw new Error(
      "Invalid monitoring-history response from backend."
    );
  }

  return {
    patient: data?.patient ?? data?.data?.patient ?? null,
    readings: readings
      .map(normalizeReading)
      .filter((reading) => reading.timestamp),
    page: data?.page ?? 1,
    limit: data?.limit ?? limit,
    totalRecords: data?.totalRecords ?? readings.length,
    totalPages: data?.totalPages ?? 1,
  };
}

// GET /api/monitoring/patients/:patientId?range=1h
// Role: tablet owner or monitor
export async function fetchPatientRecentHistory(
  patientId,
  range = "1h"
) {
  if (!patientId) {
    throw new Error("Patient ID is required.");
  }

  const { data } = await api.get(
    `/monitoring/patients/${encodeURIComponent(patientId)}`,
    { params: { range } }
  );

  const readings =
    data?.readings ??
    data?.history ??
    data?.data?.readings ??
    data?.data?.history ??
    data?.data;

  if (!Array.isArray(readings)) {
    throw new Error(
      "Invalid recent-history response from backend."
    );
  }

  return readings
    .map(normalizeReading)
    .filter((reading) => reading.timestamp);
}

export function normalizePatient(raw = {}) {
  const latest =
    raw.latestReading ??
    raw.latest ??
    raw.currentReading ??
    raw.monitoring ??
    {};

  const patientId =
    raw.patientId ??
    raw._id ??
    raw.id ??
    raw.patient?.patientId ??
    raw.patient?._id ??
    "";

  return {
    ...raw,

    id: String(patientId),
    patientId: String(patientId),

    name:
      raw.name ??
      raw.patientName ??
      raw.patient?.name ??
      raw.patient?.patientName ??
      "Unnamed patient",

    age:
      raw.age ??
      raw.patient?.age ??
      null,

    sex:
      raw.sex ??
      raw.gender ??
      raw.patient?.sex ??
      raw.patient?.gender ??
      "—",

    tabletId:
      raw.tabletId ??
      raw.assignedTabletId ??
      raw.tablet?.tabletId ??
      raw.tablet?._id ??
      "—",

    active:
      raw.active ??
      raw.isActive ??
      raw.assignmentActive ??
      raw.patient?.active ??
      raw.patient?.isActive ??
      false,

    status:
      raw.status ??
      raw.monitoringStatus ??
      raw.deviceStatus ??
      null,

    lastReadingAt:
      raw.lastReadingAt ??
      raw.lastSeenAt ??
      latest.timestamp ??
      latest.createdAt ??
      latest.recordedAt ??
      null,

    latestReading: normalizeReading(latest),

    assignmentDate:
      raw.assignmentDate ??
      raw.assignedAt ??
      raw.date ??
      raw.createdAt ??
      null,
  };
}

export function normalizeReading(raw = {}) {
  return {
    ...raw,

    spo2: finiteNumber(
      raw.spo2 ??
      raw.SpO2 ??
      raw.oxygenSaturation
    ),

    pulseRate: finiteNumber(
      raw.pulseRate ??
      raw.pr ??
      raw.PR ??
      raw.heartRate
    ),

    pi: finiteNumber(
      raw.pi ??
      raw.perfusionIndex ??
      raw.perfusion_index
    ),

    timestamp:
      raw.timestamp ??
      raw.recordedAt ??
      raw.createdAt ??
      raw.time ??
      null,
  };
}

function finiteNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
}