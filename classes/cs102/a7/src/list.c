// list.c - basic cons list
// Copyright (C) 2014 Richard Hennigan

#include <assert.h>
#include <stdlib.h>
#include <string.h>
#include <stdio.h>
#include "../lib/list.h"

list_t * list_cons(list_t * list, void * head) {
  list_t * new_list = list_init();
  new_list->head = head;
  new_list->tail = list;
  return new_list;
}

void list_dispose(list_t * list) {
  if (list == NULL) return;
  list_t ** next = &list->tail;
  free(list);
  list = NULL;
  list_dispose(* next);
}

void * list_head(list_t * list) {
  if (list == NULL) {
    printf("list_head: list is empty\n");
    exit(EXIT_FAILURE);
  }
  return list->head;
}

list_t * list_init() {
  list_t * list = malloc(sizeof(list_t));
  assert(list != NULL);
  list->head = NULL;
  list->tail = NULL;
  return list;
}

void list_iter(list_t * list, void (*f)(void * head)) {
  list_t * tmp = list;
  while (tmp != NULL) {
    (*f)(tmp->head);
    tmp = list_tail(tmp);
  }
}

list_t * list_tail(list_t * list) {
  if (list == NULL) {
    printf("list_tail: list is empty\n");
    exit(EXIT_FAILURE);
  }
  return list->tail;
}
