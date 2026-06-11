export interface FieldMetadata {
  label: string;
  dtype: 'numeric' | 'categorical' | 'date';
  options: string[];
}

export interface DashboardMetadata {
  [column: string]: FieldMetadata;
}
