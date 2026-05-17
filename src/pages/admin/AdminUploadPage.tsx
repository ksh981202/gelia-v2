import { Navigate } from "react-router-dom";

/** @deprecated 대량 업로드는 데이터 관리(/admin/manage)로 통합되었습니다. */
export default function AdminUploadPage() {
  return <Navigate to="/admin/manage" replace />;
}
