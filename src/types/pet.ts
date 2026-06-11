export type Sex = "male" | "female" | "unknown";
export type Size = "s" | "m" | "l";
export type PetType = "dog" | "cat" | "other";

export type PetPhoto = {
  _id?: string;
  url: string;
  publicId?: string;
};

export type Pet = {
  _id: string;
  name: string;
  type: string;
  breed?: string;
  age?: number;
  sex?: Sex;
  size?: Size;
  temperament?: string[];
  about?: string;
  bio?: string;
  photos?: PetPhoto[];
};
