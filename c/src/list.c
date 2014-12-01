// list.h - a simple implementation of singly-linked lists
// Copyright (C) 2014 Richard Hennigan

#include "../lib/list.h"

/******************************************************************************/
/* PRIVATE FUNCTIONS                                                          */
/******************************************************************************/

static inline list_t * last_node(list_t * list) {
  assert(list != NULL);
  while (list->tail != NULL) {
    list = list_tail(list);
  }  // end while (list->tail != NULL)
  return list;
}  // end last_node

static inline list_t * list_init() {
  list_t * list = malloc(sizeof(list_t));
  assert(list != NULL);
  list->head = NULL;
  list->tail = NULL;
  return list;
}  // end list_init

static inline list_t * list_cons(list_t * list, void * data) {
  list_t * new_list = list_init();
  new_list->head = data;
  new_list->tail = list;
  return new_list;
}  // end list_cons

static inline list_t * list_snoc(list_t * list, void * data) {
  list_t *last = list_init();
  last->head = data;
  if (list == NULL) {
    return last;
  } else {  // (list != NULL)
    last_node(list)->tail = last;
    return list;
  }  // end if (list == NULL)
}  // end list_snoc

/* static inline list_t * merge(list_t * xxs, list_t * yys, cmp_fun lt) { */
/*   if (xxs == NULL && yys == NULL) { */
/*     return NULL; */
/*   } else if (xxs == NULL) { */
/*     return yys; */
/*   } else if (yys == NULL) { */
/*     return xxs; */
/*   } else {  // (xs != NULL && ys != NULL) */
/*     void * x = list_head(xxs); */
/*     void * y = list_head(yys); */
/*     list_t * xs = list_tail(xxs); */
/*     list_t * ys = list_tail(yys); */
/*     list_t * merged = merge(xs, ys, lt); */
/*     if (lt(x, y)) { */
/*       return list_cons(list_cons(merged, y), x); */
/*     } else {  // (!lt(x, y)) */
/*       return list_cons(list_cons(merged, x), y); */
/*     }  // end if (lt(x, y)) */
/*   }  // end if (xs == NULL && ys == NULL) */
/* }  // end merge */

/******************************************************************************/
/* PUBLIC FUNCTIONS                                                           */
/******************************************************************************/
list_t * list_app(list_t * list, data_t head) {
  if (list == NULL) {
    list             = list_init();
    list->head       = head;
  } else {
    list_t * last    = last_node(list);
    last->tail       = list_init();
    last->tail->head = head;
  }
  return list;
}  // end list_app

list_t * list_copy(list_t * list) {
  if (list == NULL) {
    return NULL;
  } else {  // (list != NULL)
    return list_cons(list_copy(list_tail(list)), list_head(list));
  }  // end if (list == NULL)
}  // end list_copy

void list_dispose(list_t * list) {
  if (list == NULL) return;
  list_t * tail = list->tail;
  free(list);
  list_dispose(tail);
}  // end list_dispose

void list_dump(list_t * list) {
  printf("\nlist_dump: %p\n", list);
  printf("-------------------\n");
  printf(" list size: %lu\n", list_length(list));
  printf(" list contents:\n");
  if (list == NULL) {
    printf("  (nil)\n");
  } else {  // (list != NULL)
    while (list != NULL) {
      printf("  %p (%p)\n", list, list_head(list));
      list = list_tail(list);
    }  // end while (list != NULL)
    printf("  %p\n", list);
  }  // end if (list == NULL)
}  // end list_dump

list_t * list_extremum(list_t * list, dyn_cmp_f ex, void * dep_arg) {
  if (list == NULL) {
    return NULL;
  } else {  // (list != NULL)
    list_t * keep = list;
    list_t * next = list;
    while ((next = list_tail(next)) != NULL) {
      if (ex(list_head(next), list_head(keep), dep_arg)) {
        keep = next;
      }  // end if (ex(list_head(next), list_head(keep)))
    }  // end while (list_tail(next) != NULL)
    return keep;
  }  // end if (list == NULL)
}  // end list_extremum

list_t * list_filter(list_t * list, dyn_pred_f pred, void * dep_arg) {
  if (list == NULL) {
    return NULL;
  } else {
    list_t * filtered = list_init();
    list_t * tmp = filtered;
    while ((list = list_tail(list)) != NULL) {
      if (pred(list_head(list), dep_arg)) {
        tmp->head = list_head(list);
        tmp->tail = list_init();
        tmp = list_tail(tmp);        
      }
    }
    if (list_head(filtered) == NULL) {
      free(filtered);
      return NULL;
    } else {
      return filtered;
    }
  }
}  // end list_filter

void * list_fold(list_t * list, void * acc, fold_f f) {
  while (list != NULL) {
    acc  = f(acc, list_head(list));
    list = list_tail(list);
  }
  return acc;
}

void * list_foldl(list_t * list, void * acc, fold_f f) {
  if (list == NULL) {
    return acc;
  } else {
    data_t   x  = list_head(list);
    list_t * xs = list_tail(list);
    return list_foldl(xs, f(acc, x), f);
  }
}

void * list_foldr(list_t * list, void * acc, fold_f f) {
  if (list == NULL) {
    return acc;
  } else {
    void   * x  = list_head(list);
    list_t * xs = list_tail(list);
    return f(x, list_foldr(xs, acc, f));  // aka "the stack smasher"
  }
}

list_t * list_find(list_t * list, dyn_pred_f pred, void * dep_arg) {
  while (list != NULL) {
    if (pred(list_head(list), dep_arg)) {
      break;
    } else {
      list = list_tail(list);
    }
  }
  return list;
}  // end list_find

list_t * list_fromarray(void * array, size_t objsize, size_t length) {
  list_t * list = NULL;
  for (int i = (length-1) * objsize; i >= 0; i -= objsize) {
    list = list_cons(list, (char*)array + i);
  }  // end for (int i = (length-1) * objsize; i >= 0; i -= objsize)
  return list;
}  // end list_fromarray

inline void * list_head(list_t * list) {
  if (list == NULL) {
    printf("list_head: list is empty\n");
    exit(EXIT_FAILURE);
  } else {  // (list != NULL)
    return list->head;
  }  // end if (list == NULL)
}  // end list_head

void list_iter(list_t * list, iter_f f) {
  while (list != NULL) {
    f(list_head(list));
    list = list_tail(list);
  }  // end while (tmp != NULL)
}  // end list_iter

list_t * list_join(list_t * list1, list_t * list2) {
  if (list1 == NULL) {
    return list2;
  } else {  // (list1 != NULL)
    last_node(list1)->tail = list2;
    return list1;
  }  // end if (list1 == NULL)
}  // end list_join

size_t list_length(list_t * list) {
  size_t len = 0;
  while (list != NULL) {
    len++;
    list = list_tail(list);
  }  // end while (list != NULL)
  return len;
}  // end list_length

list_t * list_map(list_t * list, map_f f) {
  if (list == NULL) {
    return NULL;
  } else {  // (list != NULL)
    return list_cons(list_map(list_tail(list), f), f(list_head(list)));
  }  // end if (list == NULL)
}

lpair_t list_partition(list_t * list, dyn_pred_f pred, void * dep_arg) {
  lpair_t pair = { NULL, NULL };
  while (list != NULL) {
    data_t x = list_head(list);
    if (pred(x, dep_arg)) {
      pair.left = list_cons(pair.left, x);
    } else {
      pair.right = list_cons(pair.right, x);
    }
    list = list_tail(list);
  }
  return pair;
}

list_t * list_pre(list_t * list, void * data) {
  if (list == NULL) {
    list = list_init();
    list->head = data;
  } else {
    list_t * new_tail = list_cons(list_tail(list), list_head(list));
    list->head = data;
    list->tail = new_tail;
  }
  return list;
}

list_t * list_reverse(list_t * list) {
  list_t * new_list = NULL;
  while (list != NULL) {
    new_list = list_cons(new_list, list_head(list));
    list = list_tail(list);
  }  // end while (list != NULL)
  return new_list;
}  // end list_reverse

list_t * list_sort(list_t * list, cmp_f lt) {
  printf("\n\nsorting list: \n");
  list_dump(list);
  fflush(NULL);
  if (list == NULL) {
    return NULL;
  } else if (list_tail(list) == NULL) {
    return list;
  } else {  // (list != NULL)
    void * pivot = list_head(list);
    lpair_t part = list_partition(list_tail(list), lt, pivot);
    part.left = list_sort(part.left, lt);
    part.right = list_cons(list_sort(part.right, lt), pivot);
    return list_join(part.left, part.right);
  }  // end if (list == NULL)
}  // end list_sort

inline list_t * list_tail(list_t * list) {
  if (list == NULL) {
    printf("list_tail: list is empty\n");
    exit(EXIT_FAILURE);
  } else {  // (list != NULL)
    return list->tail;
  }  // end if (list == NULL)
}  // end list_tail

void * list_toarray(list_t * list, size_t size);
