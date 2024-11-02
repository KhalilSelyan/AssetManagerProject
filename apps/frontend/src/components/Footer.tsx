const Footer = () => {
  return (
    <footer className="rounded-xl shadow-lg p-4 w-full">
      {/* Right Side - Copyright */}
      <div className="text-center">
        <p className="text-gray-600">
          &copy; {new Date().getFullYear()} Asset Manager. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
