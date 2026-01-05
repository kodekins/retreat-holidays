const Footer = () => {
  return (
    <footer className="py-8 border-t border-border/30">
      <div className="container mx-auto px-4 text-center">
        <p className="text-primary font-medium tracking-wide">
          © {new Date().getFullYear()} Retreats Holidays, All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
