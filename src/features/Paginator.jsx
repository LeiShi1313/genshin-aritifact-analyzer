import { useTranslation } from "react-i18next";

const Paginator = ({
  page,
  setPage,
  offset,
  setOffset,
  totalPages,
  scrollToId = null,
}) => {
  const { t } = useTranslation();
  const pageCount = Math.max(1, Math.ceil(totalPages / offset));
  const lastPage = pageCount - 1;

  const scrollToTop = () => {
    if (scrollToId) {
      document.getElementById(scrollToId)?.scrollTo(0, 0);
    }
  };

  const handlePrePage = () => {
    if (page > 0) {
      setPage(page - 1);
      scrollToTop();
    }
  };
  const handleNextPage = () => {
    if (page < lastPage) {
      setPage(page + 1);
      scrollToTop();
    }
  };

  return (
    <nav className="flex gap-2" aria-label={t("Page navigation")}>
      <button
        type="button"
        onClick={handlePrePage}
        className="btn btn-secondary btn-circle btn-sm disabled:cursor-not-allowed"
        aria-label={t("Previous page")}
        disabled={page === 0}
      >
        <svg
          aria-hidden="true"
          focusable="false"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          width="24"
        >
          <path d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z" />
        </svg>
      </button>
      <select
        className="select-secondary select-sm bg-secondary text-secondary-content hover:bg-secondary-focus max-w-xs rounded-full"
        value={page}
        aria-label={t("Page selection")}
        onChange={(e) => setPage(Number(e.target.value))}
      >
        {[...Array(pageCount).keys()].map((i) => (
          <option key={i} value={i}>
            {i + 1}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={handleNextPage}
        className="btn btn-secondary btn-circle btn-sm disabled:cursor-not-allowed"
        aria-label={t("Next page")}
        disabled={page >= lastPage}
      >
        <svg
          aria-hidden="true"
          focusable="false"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          width="24"
        >
          <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
        </svg>
      </button>
    </nav>
  );
};

export default Paginator;
