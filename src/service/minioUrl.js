import apiInstance from './apiInstance';

export const MINIO_BASE_URL = process.env.REACT_APP_MINIO_BASE_URL || 'http://192.168.22.72:9000';

export const getFullMinioUrl = (relativeUrl) => {
  if (!relativeUrl) return null;
  if (relativeUrl.startsWith('http')) return relativeUrl;
  const cleanUrl = relativeUrl.startsWith('/') ? relativeUrl.slice(1) : relativeUrl;
  return `${MINIO_BASE_URL}/${cleanUrl}`;
};