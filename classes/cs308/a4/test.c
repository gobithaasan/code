#include <pthread.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <math.h>

#define NTHREADS 8

volatile int running_threads = 0;
pthread_mutex_t running_mutex = PTHREAD_MUTEX_INITIALIZER;

void * print_hello_world(void * tid) {
  int * id = tid;
  double val = 0.0;
  long int i;
  for (i = 1; i < 100000000000; i++) {
    val += 1.0 / (double)i;
  }

  printf("Thread #%d reults: val = %f\n", *id, val);
  pthread_mutex_lock(&running_mutex);
  running_threads--;
  pthread_mutex_unlock(&running_mutex);
  pthread_exit(NULL);
}

int main(int argc, char *argv[]) {
  pthread_t threads[NTHREADS];
  int thr_id[NTHREADS];
  int status, i;

  for (i = 0; i < NTHREADS; i++) {
    pthread_mutex_lock(&running_mutex);
    running_threads++;
    pthread_mutex_unlock(&running_mutex);
    printf("Initializing thread #%d\n", i);
    thr_id[i] = i;
    status = pthread_create(&threads[i], NULL, print_hello_world, thr_id + i);

    if (status != 0) {
      printf("pthread error %d\n", status);
      exit(EXIT_FAILURE);
    }
  }

  while (running_threads > 0)
  {
     sleep(1);
  }
  exit(EXIT_SUCCESS);
}

