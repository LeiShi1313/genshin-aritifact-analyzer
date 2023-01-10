import ReactLoading from 'react-loading'

const ThemedSuspense = ({height = 64, width = 64}) => {
    const style = {
        height,
        width
    }
    return (
        <div className="flex items-center justify-center h-screen">
            <ReactLoading type="spinningBubbles" className='fill-primary' style={style} />
        </div>
    )
}

export default ThemedSuspense;