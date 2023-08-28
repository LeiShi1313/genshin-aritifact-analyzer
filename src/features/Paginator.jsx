const Paginator = ({
  page,
  setPage,
  offset,
  setOffset,
  totalPages,
  scrollToId = null,
}) => {
  const handlePrePage = () => {
    if (page > 0) {
      setPage(page - 1);
      if (scrollToId) {
        document.getElementById(scrollToId).scrollTo(0, 0);
      }
    }
  };
  const handleNextPage = () => {
    if (page < Math.floor(totalPages / offset)) {
      setPage(page + 1);
      if (scrollToId) {
        document.getElementById(scrollToId).scrollTo(0, 0);
      }
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handlePrePage}
        className={`btn btn-secondary btn-circle btn-sm ${
          page === 0 && "btn-disabled cursor-not-allowed"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          width="24"
        >
          <path d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z" />
        </svg>
      </button>
      <select
        className="select select-secondary select-sm max-w-xs rounded-full bg-secondary text-secondary-content hover:bg-secondary-focus"
        value={page}
        onChange={(e) => setPage(Number(e.target.value))}
      >
        {[...Array(Math.ceil(totalPages / offset)).keys()].map((i) => (
          <option key={i} value={i}>
            {i}
          </option>
        ))}{" "}
      </select>
      <button
        onClick={handleNextPage}
        className={`btn btn-secondary btn-circle btn-sm ${
          page === Math.floor(totalPages / offset) &&
          "btn-disabled cursor-not-allowed"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          width="24"
        >
          <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
        </svg>
      </button>
    </div>
  );
};

export default Paginator;
