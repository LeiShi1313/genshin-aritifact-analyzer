const Paginator = ({ page, setPage, offset, setOffset, totalPages, scrollToId=null }) => {
    const handlePrePage = () => {
        if (page > 0) {
            setPage(page - 1);
            if (scrollToId) {
                document.getElementById(scrollToId).scrollTo(0, 0);
            }
        }
    }
    const handleNextPage = () => {
        if (page < Math.floor(totalPages / offset)) {
            setPage(page + 1);
            if (scrollToId) {
                document.getElementById(scrollToId).scrollTo(0, 0);
            }
        }
    }

  return (
    <div className="btn-group self-end justify-self-end space-x-0.5">
      <button
        onClick={handlePrePage}
        className={`btn btn-secondary ${page === 0 && "btn-disabled cursor-not-allowed"}`}
      >
        «
      </button>
      <select
        className="select select-secondary bg-secondary max-w-xs hover:bg-secondary-focus text-secondary-content rounded-none"
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
        className={`btn btn-secondary ${
          page === Math.floor(totalPages / offset) && "btn-disabled cursor-not-allowed"
        }`}
      >
        »
      </button>
    </div>
  );
};

export default Paginator;