import type { Entry, EntryFieldTypes } from "contentful";

export type WorksSkeleton = {
  contentTypeId: "works";
  fields: {
    title: EntryFieldTypes.Symbol;
    slug: EntryFieldTypes.Symbol;
    date?: EntryFieldTypes.Date;
    photos?: EntryFieldTypes.Array<EntryFieldTypes.AssetLink>;
  };
};

export type BiographySkeleton = {
  contentTypeId: "biography";
  fields: {
    date: EntryFieldTypes.Date;
    content: EntryFieldTypes.Symbol;
  };
};

export type NewsSkeleton = {
  contentTypeId: "news";
  fields: {
    registrationDate: EntryFieldTypes.Date;
    newsTitle: EntryFieldTypes.Symbol;
    content: EntryFieldTypes.RichText;
    url?: EntryFieldTypes.Symbol;
  };
};

export type AboutSkeleton = {
  contentTypeId: "about";
  fields: {
    name: EntryFieldTypes.Symbol;
    instagram?: EntryFieldTypes.Symbol;
    color?: EntryFieldTypes.Symbol;
    description?: EntryFieldTypes.Symbol;
  };
};

export type WorksEntry = Entry<WorksSkeleton>;
export type BiographyEntry = Entry<BiographySkeleton>;
export type NewsEntry = Entry<NewsSkeleton>;
export type AboutEntry = Entry<AboutSkeleton>;
