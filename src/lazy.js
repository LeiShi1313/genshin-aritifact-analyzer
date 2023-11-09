import React from 'react';
import { checkAppVersionAndRefresh } from './version';

const PAGE_REFRESH_KEY = 'page-has-been-force-refreshed';
const Storage = window.localStorage;
export function lazyLoadPage(page) {
    return React.lazy(async () => {
      try {
        checkAppVersionAndRefresh();
  
        const Page = await import(`./features/${page}.jsx`);
  
        Storage.setItem(PAGE_REFRESH_KEY, 'false');
  
        return Page;
      } catch (error) {
        const pageHasAlreadyBeenForceRefreshed = JSON.parse(
          Storage.getItem(PAGE_REFRESH_KEY)
        ) || false;
  
        if (!pageHasAlreadyBeenForceRefreshed) {
          Storage.setItem(PAGE_REFRESH_KEY, 'true');
          window.location.reload(true);
        }
  
        throw error;
      }
    });
  }
  