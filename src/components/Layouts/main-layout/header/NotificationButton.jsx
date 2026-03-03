// components/Header/NotificationButton.jsx
import notifications from "@/assets/icons/notifications.svg";

const NotificationButton = ({ unseenCount, setOpen }) => (
  <button
    onClick={() => setOpen(true)}
    className="notification border border-[#ccc] rounded-lg flex items-center gap-1 p-2 font-medium text-sm"
  >
    <img
      src={notifications}
      alt="notifications"
      className="w-5 md:w-6 lg:w-auto"
    />
    {unseenCount > 0 && (
      <span className="rounded-md bg-primary text-white w-4 h-4 text-[10px] flex items-center justify-center">
        {unseenCount}
      </span>
    )}
  </button>
);

export default NotificationButton;
