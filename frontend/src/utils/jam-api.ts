import axios from "axios";

export interface ICompany {
  id: number;
  company_name: string;
  liked: boolean;
}

export interface ICollection {
  id: string;
  collection_name: string;
  companies: ICompany[];
  total: number;
}

export interface ICompanyBatchResponse {
  companies: ICompany[];
}

export interface IBulkOperationEnqueueResponse {
  task_id: string;
  companies_queued_count: number;
}

export interface IBulkOperationTaskStateCounts {
  FAILURE: number;
  PENDING: number;
  RECEIVED: number;
  RETRY: number;
  REVOKED: number;
  STARTED: number;
  SUCCESS: number;
}

export interface IBulkOperationStatusResponse {
  task_id: string;
  status: string;
  task_count: number;
  status_breakdown: IBulkOperationTaskStateCounts;
}

const BASE_URL = "http://localhost:8000";

export async function getCompanies(
  offset?: number,
  limit?: number,
): Promise<ICompanyBatchResponse> {
  try {
    const response = await axios.get(`${BASE_URL}/companies`, {
      params: {
        offset,
        limit,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching companies:", error);
    throw error;
  }
}

export async function getCollectionsById(
  id: string,
  offset?: number,
  limit?: number,
): Promise<ICollection> {
  try {
    const response = await axios.get(`${BASE_URL}/collections/${id}`, {
      params: {
        offset,
        limit,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching companies:", error);
    throw error;
  }
}

export async function getCollectionsMetadata(): Promise<ICollection[]> {
  try {
    const response = await axios.get(`${BASE_URL}/collections`);
    return response.data;
  } catch (error) {
    console.error("Error fetching companies:", error);
    throw error;
  }
}

export async function addCompaniesToCollection(
  collecton_id: string,
  company_ids: number[],
  source_collection_id: string | null,
): Promise<IBulkOperationEnqueueResponse> {
  try {
    const response = await axios.post(
      `${BASE_URL}/collections/${collecton_id}/companies`,
      { company_ids: company_ids, source_collection_id: source_collection_id },
    );
    return response.data;
  } catch (error) {
    console.error("Error adding companies to collection:", error);
    throw error;
  }
}

export async function checkBulkCompanyAdd(
  task_id: string,
): Promise<IBulkOperationStatusResponse> {
  try {
    const response = await axios.get(
      `${BASE_URL}/collections/bulk_operation/${task_id}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error adding companies to collection:", error);
    throw error;
  }
}
