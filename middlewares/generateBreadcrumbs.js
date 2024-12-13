function generateBreadcrumbs(req, res, next) {
  const path = req.path;
  const breadcrumbs = [];

  if (path !== "/home") {
    breadcrumbs.push({ name: "Home", link: "/home" });
  }

  const pathParts = path.split("/").filter((part) => part);

  pathParts.forEach((part, index) => {
    const isLast = index === pathParts.length - 1; 
    let breadcrumbName;

    switch (part) {
      case "shop":
        breadcrumbName = "Shop";
        break;
      case "details":
        breadcrumbName = res.locals.product
          ? res.locals.product.name
          : "Details";
        break;
      default:
        breadcrumbName = part.charAt(0).toUpperCase() + part.slice(1); 
    }

    const link = isLast ? null : "/" + pathParts.slice(0, index + 1).join("/");

    breadcrumbs.push({
      name: breadcrumbName,
      link,
    });
  });

  res.locals.breadcrumbs = breadcrumbs;

  next();
}

module.exports = generateBreadcrumbs;
