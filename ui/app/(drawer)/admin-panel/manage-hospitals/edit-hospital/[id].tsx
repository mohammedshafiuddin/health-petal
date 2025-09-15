import HospitalForm, { initialHospitalValues } from "@/components/hospital-form";
import { useLocalSearchParams } from "expo-router";

function EditHospital() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <HospitalForm
      initialValues={{ ...initialHospitalValues, id: Number(id) }}
      submitButtonText="Save Changes"
    />
  );
}

export default EditHospital;
