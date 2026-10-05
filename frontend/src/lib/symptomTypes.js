export const SYMPTOM_TYPES = [
  { value: "bloating", label: "Bloating" },
  { value: "pain", label: "Pain" },
  { value: "nausea", label: "Nausea" },
  { value: "diarrhea", label: "Diarrhea" },
  { value: "stool", label: "Stool" },
  { value: "period", label: "Period" },
]

export const BODY_PARTS = [
  { value: "stomach", label: "Stomach" },
  { value: "digestive_tract", label: "Digestive tract" },
  { value: "head", label: "Head" },
  { value: "uterus", label: "Uterus" },
]

export const SEVERITY_SCALE = [1, 2, 3, 4, 5]

// Stored as 1-4 in the severity column; shown as words
export const FLOW_SCALE = [
  { value: 1, label: "Spotting" },
  { value: 2, label: "Light" },
  { value: 3, label: "Medium" },
  { value: 4, label: "Heavy" },
]

export const BRISTOL_SCALE = [
  { value: 1, title: "Separate hard lumps" },
  { value: 2, title: "Lumpy sausage shape" },
  { value: 3, title: "Sausage with cracks" },
  { value: 4, title: "Smooth sausage" },
  { value: 5, title: "Soft blobs" },
  { value: 6, title: "Mushy, ragged edges" },
  { value: 7, title: "Liquid" },
]
