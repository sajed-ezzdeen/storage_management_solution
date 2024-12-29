"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getFiles } from "@/lib/actions/file.actions";
import { Models } from "node-appwrite";
import Thumbnail from "./Thumbnail";
import FormattedDateTime from "./FormattedDateTime"; 
import { useDebounce } from "use-debounce";

const Search = () => {  

  const [query, setQuery] = useState("");
  const searchParams = useSearchParams(); // Functionality : The useSearchParams hook returns a URLSearchParams object that contains the query parameters of the current URL.
  const searchQuery = searchParams.get("query") || ""; // Functionality : The searchQuery variable stores the value of the query parameter from the URL. If the query parameter is not present, it defaults to an empty string.
  const [results, setResults] = useState<Models.Document[]>([]); // Functionality : The results state variable stores an array of documents returned from the search query.
  const [open, setOpen] = useState(false); // Functionality : The open state variable stores a boolean value that determines whether the search results are displayed.
  const router = useRouter(); // Functionality : The useRouter hook returns the router object, which provides access to the router instance.
  const path = usePathname();  
  const [debouncedQuery] = useDebounce(query, 300); // Functionality : The useDebounce hook returns a debounced value of the query state variable. The debounced value is updated after 300 milliseconds.


  useEffect(() => {
    const fetchFiles = async () => {  

      if(debouncedQuery.length === 0) {
        setResults([]);
        setOpen(false);
        return router.push(path.replace(searchParams.toString(), ""));
      }
      const files = await getFiles({ types: [] ,searchText: query });
      setResults(files.documents);
      setOpen(true);
    };

    fetchFiles();
  }, [debouncedQuery]);

  useEffect(() => {
    if (!searchQuery) {
      setQuery("");
    }
  }, [searchQuery]);

  const handleClickItem = (file: Models.Document) => {
    setOpen(false);
    setResults([]);

    router.push(
      `/${(file.type === "video" || file.type === "audio") ? "media" : file.type + "s"}?query=${query}`
    );
  };

  return (
    <div className="search">
      <div className="search-input-wrapper">
        <Image
          src="/assets/icons/search.svg"
          alt="Search"
          width={24}
          height={24}
        />
        <Input
          value={query}
          placeholder="Search..."
          className="search-input"
          onChange={(e) => setQuery(e.target.value)}
        />

        {open && (
          <ul className="search-result">
            {results.length > 0 ? (
              results.map((file) => (
                <li
                  key={file.$id}
                  className="flex items-center justify-between" 
                  onClick={() => handleClickItem(file)} 
                >
                  <div className="flex cursor-pointer items-center gap-4">
                    <Thumbnail
                      type={file.type}
                      extension={file.extension}
                      url={file.url}
                      className="size-9 min-w-9"
                    />
                    <p className="subtitle-2 line-clamp-1 text-light-100">
                      {file.name}
                    </p>
                  </div>
                  <FormattedDateTime
                    date={file.$createdAt}
                    className="caption line-clamp-1 text-light-200"
                  />
                </li>
              ))
            ) : (
              <p className="empty-result">No files found</p>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Search;
