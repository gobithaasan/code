#include "../lib/util.h"

/****************************************************************************/
const char * type_names[] = {
  [DT_BLK]     = "BLK",
  [DT_CHR]     = "CHR",
  [DT_DIR]     = "DIR",
  [DT_FIFO]    = "FIF",
  [DT_LNK]     = "LNK",
  [DT_REG]     = "REG",
  [DT_SOCK]    = "SCK",
  [DT_UNKNOWN] = "???"
};

const char * type_colors[] = {
  [DT_BLK]     = C_BIGreen,
  [DT_CHR]     = C_BIYellow,
  [DT_DIR]     = C_BIBlue,
  [DT_FIFO]    = C_BIPurple,
  [DT_LNK]     = C_BICyan,
  [DT_REG]     = C_BIWhite,
  [DT_SOCK]    = C_BIRed,
  [DT_UNKNOWN] = C_On_Red C_BIWhite
};

const char * depth_colors[] = {
  [0] = C_RED,
  [1] = C_GREEN,
  [2] = C_YELLOW,
  [3] = C_BLUE,
  [4] = C_PURPLE,
  [5] = C_CYAN
};

enum units {
  BYTES,
  KBYTES,
  MBYTES,
  GBYTES
};

const char * units[] = {
  [BYTES]  = C_GREEN            "B"  C_OFF,
  [KBYTES] = C_YELLOW           "KB" C_OFF,
  [MBYTES] = C_RED              "MB" C_OFF,
  [GBYTES] = C_On_Red C_BIWhite "GB" C_OFF
};

/****************************************************************************/
void display_usage(char * name) {
  u_int i, b = 0;
  for (i = 0; i < strlen(name); i++)
    b = name[i] == '/' ? i+1 : b;
  printf("%s usage:\n", name+b);
  printf("---------------------------------------------------------------\n");
  printf("%s --help            : ", name+b);
  printf("display this help screen.\n");
  printf("%s --setup           : ", name+b);
  printf("create a set of sample directories and files for");
  printf("                                testing.\n");
  printf("%s (no arguments)    : ", name+b);
  printf("show the filesystem structure relative to the current");
  printf("                           working directory.\n");
  printf("%s path1 path2 [...] : ", name+b);
  printf("show the filesystem structure relative to each path");
  printf("                             given in {path1, path2, ...}.\n");
}

/****************************************************************************/
static inline unsigned char fix_type(mode_t m) {
  mode_t masked = m & S_IFMT;
  return masked == S_IFREG ? DT_REG
       : masked == S_IFDIR ? DT_DIR
       : masked == S_IFCHR ? DT_CHR
       : masked == S_IFBLK ? DT_BLK
       : masked == S_IFIFO ? DT_FIFO
       : masked == S_IFLNK ? DT_LNK
       : masked == S_IFSOCK ? DT_SOCK
       : DT_UNKNOWN;
}

/****************************************************************************/
static inline char * byte_str(unsigned long b) {
  static char str[80];
  unsigned long i = 0;
  while (b > 9999) {
    i++;
    b /= 1024;
  }
  snprintf(str, 80, "%lu%s", b, units[i]);
  return str;
}

/****************************************************************************/
inline bool is_dir(const char * path) {
  struct stat fs;
  if (lstat(path, &fs) == -1) {
    perror("lstat");
    exit(EXIT_FAILURE);
  }
  return S_ISDIR(fs.st_mode);
}

/****************************************************************************/
list_t * dir_list(const char * dir_name, u_int depth) {
  DIR * dir = opendir(dir_name);

  if (!dir) {
    perror("dir_list opendir");
    exit(EXIT_FAILURE);
  }

  list_t * entries = NULL;
  struct dirent * entry;

  while ((entry = readdir(dir)) != NULL) {
    struct stat file_stat;
    fsys_node_t * f_info = malloc(sizeof(fsys_node_t));

    if (f_info == NULL) {
      perror("malloc");
      exit(EXIT_FAILURE);
    }

    size_t len = strlen(dir_name);
    char path[NAME_MAX];
    snprintf(path, len+1, "%s", dir_name);
    path[len]   = '/';
    path[len+1] = '\0';

    char * name = strcat(path, entry->d_name);

    if (lstat(name, &file_stat) == -1) {
      perror("lstat");
      exit(EXIT_FAILURE);
    }

    snprintf(f_info->name, NAME_MAX, "%s", name);

    /* f_info->d_ino      = entry->d_ino; */
    /* f_info->d_off      = entry->d_off; */
    /* f_info->d_reclen   = entry->d_reclen; */
    f_info->type       = fix_type(file_stat.st_mode);
    f_info->depth      = depth;
    /* f_info->st_dev     = file_stat.st_dev; */
    f_info->dev_maj    = major(file_stat.st_dev);
    f_info->dev_min    = minor(file_stat.st_dev);
    f_info->st_ino     = file_stat.st_ino;
    f_info->st_mode    = file_stat.st_mode;
    f_info->st_nlink   = file_stat.st_nlink;
    f_info->st_uid     = file_stat.st_uid;
    f_info->st_gid     = file_stat.st_gid;
    f_info->st_rdev    = file_stat.st_rdev;
    f_info->st_size    = file_stat.st_size;
    f_info->st_blksize = file_stat.st_blksize;
    f_info->st_blocks  = file_stat.st_blocks;
    f_info->atime      = file_stat.st_atime;
    f_info->mtime      = file_stat.st_mtime;
    f_info->ctime      = file_stat.st_ctime;

    size_t nlen = strlen(name);

    if (depth <= DEPTH_LIMIT && S_ISDIR(f_info->st_mode) &&
        !(name[nlen-1] == '.' &&
         (name[nlen-2] == '/' ||
         (name[nlen-2] == '.' &&
          name[nlen-3] == '/')))) {
      const char * dlname = f_info->name;
      f_info->sub_nodes = dir_list(dlname, depth+2);
    } else {
      f_info->sub_nodes = NULL;
    }

    entries = list_pre(entries, f_info);
  }

  if (closedir(dir) == -1) {
    perror("closedir");
    exit(EXIT_FAILURE);
  }

  list_t * sorted = list_sort(entries, &name_cmp);
  return sorted;
}

/****************************************************************************/
fsys_node_t * file_list(const char * name, u_int depth) {
  struct stat file_stat;
  fsys_node_t * f_info = malloc(sizeof(fsys_node_t));

  if (f_info == NULL) {
    perror("malloc");
    exit(EXIT_FAILURE);
  }

  if (lstat(name, &file_stat) == -1) {
    perror("lstat");
    exit(EXIT_FAILURE);
  }

  snprintf(f_info->name, NAME_MAX, "%s", name);

  f_info->type       = fix_type(file_stat.st_mode);
  f_info->depth      = depth;
  f_info->dev_maj    = major(file_stat.st_dev);
  f_info->dev_min    = minor(file_stat.st_dev);
  f_info->st_ino     = file_stat.st_ino;
  f_info->st_mode    = file_stat.st_mode;
  f_info->st_nlink   = file_stat.st_nlink;
  f_info->st_uid     = file_stat.st_uid;
  f_info->st_gid     = file_stat.st_gid;
  f_info->st_rdev    = file_stat.st_rdev;
  f_info->st_size    = file_stat.st_size;
  f_info->st_blksize = file_stat.st_blksize;
  f_info->st_blocks  = file_stat.st_blocks;
  f_info->atime      = file_stat.st_atime;
  f_info->mtime      = file_stat.st_mtime;
  f_info->ctime      = file_stat.st_ctime;

  return f_info;
}

/****************************************************************************/
const char * vert = B_VT C_OFF;

static inline void pv(size_t depth) {
  size_t i;
  for (i = 0; i < depth / 2; i++)
    printf(" %s%s", depth_colors[i%6], vert);
}

/****************************************************************************/
static inline bool ndir(fsys_node_t * f_info) {
  size_t nlen = strlen(f_info->name);
  return S_ISDIR(f_info->st_mode) &&
         !(f_info->name[nlen-1] == '.' &&
          (f_info->name[nlen-2] == '/' ||
          (f_info->name[nlen-2] == '.' &&
           f_info->name[nlen-3] == '/')));
}

/****************************************************************************/
inline void display_label(const char * text) {
  printf("%s%s %s %s\n", C_On_Blue, C_BIWhite, text, C_OFF);
}

/****************************************************************************/
void display_fs_node(void * node_addr) {
  fsys_node_t * f_info = (fsys_node_t *)node_addr;

  int    type     = f_info->type;
  mode_t mode     = f_info->st_mode;
  char   mstr[11] = "          ";

  mstr[0] = S_ISDIR(mode)    ? 'd' : '-';

  mstr[1] = (mode & S_IRUSR) ? 'r' : '-';
  mstr[2] = (mode & S_IWUSR) ? 'w' : '-';
  mstr[3] = (mode & S_IXUSR) ? 'x' : '-';

  mstr[4] = (mode & S_IRGRP) ? 'r' : '-';
  mstr[5] = (mode & S_IWGRP) ? 'w' : '-';
  mstr[6] = (mode & S_IXGRP) ? 'x' : '-';

  mstr[7] = (mode & S_IROTH) ? 'r' : '-';
  mstr[8] = (mode & S_IWOTH) ? 'w' : '-';
  mstr[9] = (mode & S_IXOTH) ? 'x' : '-';

  /* Get user and group names */
  struct passwd * pw = getpwuid(f_info->st_uid);
  struct group  * gr = getgrgid(f_info->st_gid);

  if (pw == NULL) {
    perror("getpwuid");
    exit(EXIT_FAILURE);
  }

  if (gr == NULL) {
    perror("getgrgid");
    exit(EXIT_FAILURE);
  }

  char * user_name = pw->pw_name;
  char * gr_name   = gr->gr_name;

  /* Truncate user and group names to 8 characters */
  user_name[8] = '\0';
  gr_name[8]   = '\0';

  /* Indicate if file has execute permissions */
  bool exec_b = (mode & S_IXUSR) || (mode & S_IXGRP) || (mode & S_IXOTH);

  const char * leftc     = ndir(f_info) ? B_TL : " ";
  const char * lbl_bg    = ndir(f_info) ? C_On_Blue : C_On_Black;
  const char * lbl_color = ndir(f_info) ? C_BIWhite :
                           (type == DT_REG && exec_b) ?
                           C_BIGreen :
                           type_colors[type];

  /* Strip leading characters in path name to show only base file name */
  size_t b = 0;
  for (u_int i = b; i < strlen(f_info->name); i++)
    b = f_info->name[i] == '/' ? i + 1: b;

  /* File modification timestamp */
  char time_str[80];
  strftime(time_str, 80, "%F %T", localtime(&f_info->mtime));
  
  pv(f_info->depth);
  printf(" %s%s%s %-23s %s", lbl_bg, lbl_color, leftc, f_info->name + b, C_OFF);
  printf(" %s%-3s%s", type_colors[type], type_names[type], C_OFF);
  printf(" %s\n", time_str);
  pv(f_info->depth);
  if (ndir(f_info)) {
    pv(2);
  } else {
    printf("  ");
  }
  printf(" %s", mstr);
  printf(" %-8s", user_name);
  printf(" %-8s", gr_name);
  printf(" %2lu", f_info->st_nlink);
  printf(" %16s", byte_str(f_info->st_size));
  printf(" %10lu", (u_int64_t)f_info->st_ino);
  printf("\n");

  if (f_info->sub_nodes != NULL) {
    list_iter(f_info->sub_nodes, &display_fs_node);
    list_iter(f_info->sub_nodes, &free);
    list_dispose(f_info->sub_nodes);
    pv(f_info->depth);
    printf(" %s", C_BIWhite B_BL);
    for (u_int i = 0; i < 50; i++)
      printf("%s", B_HR);
    printf("%s\n", C_OFF);
  }
}

/****************************************************************************/
bool name_cmp(void * a, void * b) {
  fsys_node_t * node1 = a;
  fsys_node_t * node2 = b;
  char * str1  = node1->name;
  char * str2  = node2->name;
  bool   cmp   = node1->type == node2->type ?
                 strcmp(str1, str2) < 1 :
                 node1->type < node2->type;
  return cmp;
}

/****************************************************************************/
/* FUNCTIONS FOR CREATING TEST FILES */
/****************************************************************************/
static inline void create_socket(char * socket_path) {
  printf(" creating socket: %s\n", socket_path);
  struct sockaddr_un addr;
  int fd = socket(AF_UNIX, SOCK_STREAM, 0);

  if (fd == -1) {
    perror("socket error");
    exit(EXIT_FAILURE);
  }

  memset(&addr, 0, sizeof(addr));
  addr.sun_family = AF_UNIX;
  strncpy(addr.sun_path, socket_path, sizeof(addr.sun_path)-1);
  unlink(socket_path);

  if (bind(fd, (struct sockaddr*)&addr, sizeof(addr)) == -1) {
    perror("bind error");
    exit(EXIT_FAILURE);
  }
}

/****************************************************************************/
static inline void create_fifo(char * fifo_path) {
  printf(" creating fifo: %s\n", fifo_path);
  mkfifo(fifo_path, 0666);
}

/****************************************************************************/
static inline void create_rand(char * rand_path, size_t size) {
  printf(" creating random file: %s (%lu bytes)\n", rand_path, size);
  char   buffer[BUFSIZ];
  mode_t mode    = S_IRUSR | S_IWUSR | S_IRGRP | S_IROTH;
  int    urandom = open("/dev/urandom", O_RDONLY);
  int    randomf = open(rand_path, O_WRONLY | O_CREAT | O_TRUNC, mode);
  size_t total   = 0;

  if (urandom == -1) {
    perror("open urandom");
    exit(EXIT_FAILURE);
  }

  if (randomf == -1) {
    perror("open randomf");
    exit(EXIT_FAILURE);
  }

  while (total < size) {
    size_t bytes_read = read(urandom, buffer, BUFSIZ);

    if (bytes_read < BUFSIZ) {
      perror("read urandom");
      exit(EXIT_FAILURE);
    }

    size_t to_send    = MIN(size - total, BUFSIZ);
    size_t bytes_sent = write(randomf, buffer, to_send);

    if (bytes_sent != to_send) {
      perror("write randomf");
      exit(EXIT_FAILURE);
    }

    total += bytes_sent;
  }

  close(urandom);
  close(randomf);
}

/****************************************************************************/
static inline void create_symlink(const char * target, const char * lpath) {
  printf(" creating symlink: %s -> %s\n", target, lpath);
  int result = symlink(target, lpath);
  if (result == -1 && errno != EEXIST) {
    perror("symlink");
    exit(EXIT_FAILURE);
  }
}

/****************************************************************************/
static inline void create_link(const char * target, const char * lpath) {
  printf(" creating link: %s -> %s\n", target, lpath);
  int result = link(target, lpath);
  if (result == -1 && errno != EEXIST) {
    perror("link");
    exit(EXIT_FAILURE);
  }
}

/****************************************************************************/
static inline void mkdirp(char * dir) {
  printf(" creating directory: %s\n", dir);
  mode_t dir_modes = S_IRWXU | S_IRWXG | S_IROTH | S_IXOTH;
  int result = mkdir(dir, dir_modes);
  if (result == -1 && errno != EEXIST) {
    perror("mkdir");
    exit(EXIT_FAILURE);
  };
}

/****************************************************************************/
void create_test_files() {
  printf("creating test files...\n");
  
  mkdirp("misc");
  mkdirp("misc/random_files");
  mkdirp("misc/random_files/more_files");
  mkdirp("misc/extras");

  create_fifo("misc/fifo1");
  create_fifo("misc/extras/fifo2");

  create_socket("misc/socket1");
  create_socket("misc/extras/socket2");
  create_socket("misc/extras/socket3");

  create_link("misc/socket1", "misc/hardlink_to_socket1");
  create_symlink("misc/socket1", "misc/symlink_to_socket1");
  /* create_link("/dev/null", "misc/devnull"); */
  
  create_rand("misc/random_files/random1",            26214400);
  create_rand("misc/random_files/random2",            512000);
  create_rand("misc/random_files/more_files/random3", 5000);
  create_rand("misc/random_files/more_files/random4", 10);

  printf("done!\n");
}
