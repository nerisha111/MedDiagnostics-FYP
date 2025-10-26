import { useEffect } from 'react';

/**
 * A custom React hook to dynamically update the document's title (the browser tab title).
 * @param title 
 */
export function useDocumentTitle(title: string) {
  useEffect(() => {
   
    document.title = title;
  }, [title]); 
}