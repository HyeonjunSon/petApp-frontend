export type Pet = {
  _id: string;
  name: string;
  species?: string;
  breed?: string;
  ageYears?: number;
  about?: string;
  photos?: { url: string }[];
};
