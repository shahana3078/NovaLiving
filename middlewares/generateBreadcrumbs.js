function generateBreadcrumbs(req, res, next) {
  const path = req.path;
  const breadcrumbs = [];

  if (path !== "/home") {
    breadcrumbs.push({ name: "Home", link: "/home" });
  }

  const pathParts = path.split("/").filter((part) => part);

  pathParts.forEach((part, index) => {
    const isLast = index === pathParts.length - 1;
    let breadcrumbName = part.charAt(0).toUpperCase() + part.slice(1);

    if (part === "shop") {
      breadcrumbName = "Shop";
    }

    if (part === "details" && req.params.id && res.locals.product) {
      breadcrumbName = res.locals.product.name;
    }

    const link = "/" + pathParts.slice(0, index + 1).join("/");

    breadcrumbs.push({
      name: breadcrumbName,
      link: isLast ? null : link,
    });
  });

  res.locals.breadcrumbs = breadcrumbs;

  next();
}

module.exports = generateBreadcrumbs;
