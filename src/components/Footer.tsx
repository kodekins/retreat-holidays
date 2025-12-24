const Footer = () => {
  return (
    <footer className="py-6 border-t border-border">
      <div className="container mx-auto px-4 text-center">
        <p className="text-primary text-sm">
          © {new Date().getFullYear()} Retreats Holidays, All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
